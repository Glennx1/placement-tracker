"""
PES Placement Tracker - Gmail Scanner & Sync Engine
Scans your Gmail inbox for emails tagged with "PESU_TRACKED" / "PESU_TAGGED" or from "@pes.edu",
extracts key info (Excel attachments, Google Forms, PESU Academy notices),
and streams them directly to your Placement Tracker dashboard (Localhost or Vercel).

Usage:
  python scripts/sync_gmail_local.py
  python scripts/sync_gmail_local.py --user your_name@gmail.com --password "xxxx xxxx xxxx xxxx" --webhook https://placement-tracker-teal.vercel.app/api/parse-email --since 20-Jul-2024

Requirements:
  pip install requests
"""

import imaplib
import email
from email.header import decode_header
import json
import requests
import sys
import os
import argparse
import re
import time

# --- DEFAULT CONFIGURATION ---
DEFAULT_GMAIL_USER = os.getenv("GMAIL_USER", "your_email@gmail.com")
DEFAULT_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx")
DEFAULT_WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://placement-tracker-teal.vercel.app/api/parse-email")
DEFAULT_LABELS = ["PESU_TRACKED", "pesu_tracked", "PESU_TAGGED", "pesu_tagged"]


def decode_str(s):
    if s is None:
        return ""
    decoded_list = decode_header(s)
    result = ""
    for decoded, charset in decoded_list:
        if isinstance(decoded, bytes):
            try:
                result += decoded.decode(charset or "utf-8", errors="ignore")
            except Exception:
                result += decoded.decode("latin-1", errors="ignore")
        else:
            result += str(decoded)
    return result


def extract_email_data(msg):
    body = ""
    html_body = ""
    attachments = []

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            filename = part.get_filename()

            if filename:
                decoded_fn = decode_str(filename)
                attachments.append(decoded_fn)

            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body += payload.decode(part.get_content_charset() or "utf-8", errors="ignore") + "\n"
            elif content_type == "text/html" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    html_body += payload.decode(part.get_content_charset() or "utf-8", errors="ignore") + "\n"
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode(msg.get_content_charset() or "utf-8", errors="ignore")

    # If no plain text, convert HTML to clean text
    if not body.strip() and html_body:
        # Simple HTML tag stripping
        clean_text = re.sub(r'<[^>]+>', ' ', html_body)
        body = re.sub(r'\s+', ' ', clean_text).strip()

    # Append attachment references if present
    if attachments:
        body += f"\n\n[Attached Files in Email: {', '.join(attachments)}]"

    return body.strip(), attachments


def scan_and_sync_gmail(gmail_user, app_password, webhook_url, custom_label=None, since_date=None):
    print("=" * 70)
    print("  PES University Placement & Opportunities - Gmail Sync Engine")
    print("=" * 70)
    print(f"[*] Account:  {gmail_user}")
    print(f"[*] Webhook:  {webhook_url}")
    if since_date:
        print(f"[*] Since:    {since_date}")
    print()

    if "your_email" in gmail_user or "xxxx" in app_password:
        print("[!] Please provide your Gmail credentials.")
        print("[!] Generate a 16-character App Password at: https://myaccount.google.com/apppasswords\n")
        try:
            if "your_email" in gmail_user:
                gmail_user = input("Enter your Gmail address: ").strip()
            if "xxxx" in app_password:
                app_password = input("Enter your 16-char App Password: ").strip()
            if not gmail_user or not app_password:
                print("[-] Aborted: Gmail credentials required.")
                return
        except KeyboardInterrupt:
            print("\n[-] Cancelled by user.")
            return

    print(f"[*] Connecting to imap.gmail.com...")
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(gmail_user, app_password)
        print("[+] Logged into Gmail successfully!\n")
    except Exception as e:
        print(f"[-] Login failed: {e}")
        print("[!] Ensure 2FA is active and use an App Password.")
        return

    msg_ids = []
    labels_to_try = [custom_label] if custom_label else DEFAULT_LABELS

    # 1. Try selecting each possible label folder directly
    for lbl in labels_to_try:
        if not lbl:
            continue
        try:
            res, _ = mail.select(f'"{lbl}"')
            if res == "OK":
                search_query = f'(SINCE "{since_date}")' if since_date else "ALL"
                status, messages = mail.search(None, search_query)
                if status == "OK" and messages[0]:
                    found = messages[0].split()
                    if found:
                        msg_ids = found
                        print(f"[+] Found {len(msg_ids)} emails in label folder '{lbl}'.")
                        break
        except Exception:
            pass

    # 2. Search Inbox with Gmail raw query for labels or domain
    if not msg_ids:
        mail.select("inbox")
        print("[*] Searching Inbox for PES labels (PESU_TRACKED / PESU_TAGGED) or @pes.edu...")
        
        for lbl in labels_to_try:
            if not lbl:
                continue
            try:
                raw_q = f'label:{lbl}'
                if since_date:
                    raw_q += f' after:{since_date}'
                status, messages = mail.search(None, f'X-GM-RAW "{raw_q}"')
                if status == "OK" and messages[0]:
                    found = messages[0].split()
                    if found:
                        msg_ids = found
                        print(f"[+] Found {len(msg_ids)} emails matching label:{lbl}")
                        break
            except Exception:
                pass

        # 3. Fallback: Search all emails from @pes.edu
        if not msg_ids:
            try:
                domain_q = 'FROM "@pes.edu"'
                if since_date:
                    domain_q += f' SINCE {since_date}'
                status, messages = mail.search(None, domain_q)
                if status == "OK" and messages[0]:
                    msg_ids = messages[0].split()
                    print(f"[+] Found {len(msg_ids)} emails from sender '@pes.edu'")
            except Exception:
                pass

    if not msg_ids:
        print("[*] No matching emails found.")
        mail.logout()
        return

    print(f"[*] Processing {len(msg_ids)} messages...\n")
    success_count = 0

    for msg_id in msg_ids:
        res, data = mail.fetch(msg_id, "(RFC822)")
        if res != "OK":
            continue

        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject = decode_str(msg.get("Subject"))
        sender = decode_str(msg.get("From"))
        date_str = msg.get("Date")
        body, attachments = extract_email_data(msg)

        clean_id = msg_id.decode() if isinstance(msg_id, bytes) else str(msg_id)
        payload = {
            "subject": subject,
            "sender": sender,
            "body": body,
            "receivedAt": date_str,
            "gmailMessageId": f"imap_{clean_id}"
        }

        print(f"[>] Syncing: {subject[:65]}...")
        if attachments:
            print(f"    [Attachment] Found: {', '.join(attachments)}")

        try:
            resp = requests.post(webhook_url, json=payload, timeout=15)
            if resp.status_code == 200:
                resp_json = resp.json()
                drive_name = resp_json.get("data", {}).get("drive", {}).get("name", "Opportunity")
                cat = resp_json.get("data", {}).get("drive", {}).get("category", "COMPANY")
                events_len = len(resp_json.get("data", {}).get("drive", {}).get("events", []))
                print(f"    [OK] Added to [{cat}] {drive_name} -> m{events_len}")
                success_count += 1
            else:
                print(f"    [WARN] Webhook responded with status {resp.status_code}")
        except Exception as err:
            print(f"    [ERR] Failed to post: {err}")

    mail.close()
    mail.logout()
    print("\n" + "=" * 70)
    print(f"[+] Successfully synced {success_count} emails into your Placement Tree!")
    print(f"[+] View dashboard at: {webhook_url.replace('/api/parse-email', '')}")
    print("=" * 70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Gmail PES emails with Placement Tracker")
    parser.add_argument("--user", default=DEFAULT_GMAIL_USER, help="Gmail address")
    parser.add_argument("--password", default=DEFAULT_APP_PASSWORD, help="Google App Password (16-character)")
    parser.add_argument("--webhook", default=DEFAULT_WEBHOOK_URL, help="Placement Tracker webhook URL")
    parser.add_argument("--label", default=None, help="Gmail Label (e.g. PESU_TRACKED or PESU_TAGGED)")
    parser.add_argument("--since", default="20-Jul-2024", help="Start date (default: 20-Jul-2024)")

    args = parser.parse_args()
    scan_and_sync_gmail(args.user, args.password, args.webhook, args.label, args.since)


