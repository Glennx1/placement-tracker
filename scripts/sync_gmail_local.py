"""
PES Placement Tracker - Gmail Scanner & Sync Engine
Scans your Gmail inbox for emails tagged with "PESU_TAGGED" or from "@pes.edu",
and streams them directly to your Placement Tracker dashboard (Localhost or Vercel).

Usage:
  python scripts/sync_gmail_local.py
  python scripts/sync_gmail_local.py --user your_name@gmail.com --password "xxxx xxxx xxxx xxxx" --webhook https://placement-tracker-teal.vercel.app/api/parse-email

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
import time

# --- DEFAULT CONFIGURATION (can also be passed via CLI flags or env) ---
DEFAULT_GMAIL_USER = os.getenv("GMAIL_USER", "your_email@gmail.com")
DEFAULT_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx")
DEFAULT_WEBHOOK_URL = os.getenv("WEBHOOK_URL", "http://localhost:3000/api/parse-email")
DEFAULT_LABEL = "PESU_TAGGED"


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


def get_email_body(msg):
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode(part.get_content_charset() or "utf-8", errors="ignore")
                    break
            elif content_type == "text/html" and not body and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    body = payload.decode(part.get_content_charset() or "utf-8", errors="ignore")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode(msg.get_content_charset() or "utf-8", errors="ignore")
    return body.strip()


def scan_and_sync_gmail(gmail_user, app_password, webhook_url, label_name):
    print("=" * 65)
    print("  PES Placement Tracker - Gmail Sync Engine")
    print("=" * 65)
    print(f"[*] Account:  {gmail_user}")
    print(f"[*] Label:    {label_name}")
    print(f"[*] Webhook:  {webhook_url}\n")

    if "your_email" in gmail_user or "xxxx" in app_password:
        print("[!] Note: Please provide your Gmail and Google App Password.")
        print("[!] Generate an App Password at: https://myaccount.google.com/apppasswords\n")
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
        print("[!] Ensure 2FA is enabled and use an App Password (not your account login password).")
        return

    # Try searching in the specific label/mailbox first, fallback to search query
    msg_ids = []
    
    # 1. Try selecting label folder directly
    try:
        res, _ = mail.select(f'"{label_name}"')
        if res == "OK":
            print(f"[*] Opened mailbox/label: {label_name}")
            status, messages = mail.search(None, "ALL")
            if status == "OK" and messages[0]:
                msg_ids = messages[0].split()
                print(f"[+] Found {len(msg_ids)} emails in '{label_name}' folder.")
    except Exception:
        pass

    # 2. If no messages found in folder, search in all mail / inbox with label query or from:pes.edu
    if not msg_ids:
        mail.select("inbox")
        print(f"[*] Searching inbox for label '{label_name}' or sender '@pes.edu'...")
        
        # Try Gmail raw search for label
        try:
            status, messages = mail.search(None, f'X-GM-RAW "label:{label_name}"')
            if status == "OK" and messages[0]:
                msg_ids = messages[0].split()
                print(f"[+] Found {len(msg_ids)} emails with label:{label_name}")
        except Exception:
            pass

        # Fallback to domain search if label search returned nothing
        if not msg_ids:
            try:
                status, messages = mail.search(None, 'FROM "@pes.edu"')
                if status == "OK" and messages[0]:
                    msg_ids = messages[0].split()
                    print(f"[+] Found {len(msg_ids)} emails from @pes.edu")
            except Exception:
                pass

    if not msg_ids:
        print(f"[*] No matching emails found under label '{label_name}' or from '@pes.edu'.")
        mail.logout()
        return

    print(f"[*] Processing {min(len(msg_ids), 30)} recent messages...\n")
    success_count = 0

    for msg_id in msg_ids[-30:]:
        res, data = mail.fetch(msg_id, "(RFC822)")
        if res != "OK":
            continue

        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject = decode_str(msg.get("Subject"))
        sender = decode_str(msg.get("From"))
        date_str = msg.get("Date")
        body = get_email_body(msg)

        clean_id = msg_id.decode() if isinstance(msg_id, bytes) else str(msg_id)
        payload = {
            "subject": subject,
            "sender": sender,
            "body": body,
            "receivedAt": date_str,
            "gmailMessageId": f"imap_{clean_id}"
        }

        print(f"[>] Ingesting: {subject[:70]}...")
        try:
            resp = requests.post(webhook_url, json=payload, timeout=12)
            if resp.status_code == 200:
                resp_json = resp.json()
                drive_name = resp_json.get("data", {}).get("drive", {}).get("name", "Opportunity")
                cat = resp_json.get("data", {}).get("drive", {}).get("category", "COMPANY")
                print(f"    [OK] Added to [{cat}] {drive_name}")
                success_count += 1
            else:
                print(f"    [WARN] Server responded with HTTP {resp.status_code}")
        except Exception as err:
            print(f"    [ERR] Webhook post failed: {err}")

    mail.close()
    mail.logout()
    print("\n" + "=" * 65)
    print(f"[+] Successfully synced {success_count} emails into Placement Tracker!")
    print(f"[+] View dashboard at: {webhook_url.replace('/api/parse-email', '')}")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Gmail PES emails with Placement Tracker")
    parser.add_argument("--user", default=DEFAULT_GMAIL_USER, help="Gmail address")
    parser.add_argument("--password", default=DEFAULT_APP_PASSWORD, help="Google App Password (16-character)")
    parser.add_argument("--webhook", default=DEFAULT_WEBHOOK_URL, help="Placement Tracker webhook URL")
    parser.add_argument("--label", default=DEFAULT_LABEL, help="Gmail Label (default: PESU_TAGGED)")

    args = parser.parse_args()
    scan_and_sync_gmail(args.user, args.password, args.webhook, args.label)

