"""
PES Placement Tracker - Local Gmail Scanner Script
Scans your personal @gmail.com inbox for incoming emails from @pes.edu domains
and streams them directly to your local Placement Tracker at http://localhost:3000/api/parse-email.

Requirements:
  pip install requests
"""

import imaplib
import email
from email.header import decode_header
import json
import requests
import sys
import time

# --- CONFIGURATION ---
GMAIL_USER = "your_email@gmail.com"           # Your personal Gmail address
GMAIL_APP_PASSWORD = "xxxx xxxx xxxx xxxx"    # 16-character Google App Password (from https://myaccount.google.com/apppasswords)
WEBHOOK_URL = "http://localhost:3000/api/parse-email"
SEARCH_CRITERIA = 'FROM "@pes.edu"'           # Filter for emails from @pes.edu


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


def scan_and_sync_gmail():
    print(f"[*] Connecting to Gmail for {GMAIL_USER}...")
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        mail.select("inbox")
        print("[+] Logged into Gmail successfully!")
    except Exception as e:
        print(f"[-] Login failed: {e}")
        print("[!] Tip: Generate a 16-character App Password at: https://myaccount.google.com/apppasswords")
        return

    # Search for all emails from @pes.edu
    status, messages = mail.search(None, SEARCH_CRITERIA)
    if status != "OK" or not messages[0]:
        print("[*] No emails matching criteria found.")
        mail.logout()
        return

    msg_ids = messages[0].split()
    print(f"[*] Found {len(msg_ids)} emails from @pes.edu. Processing recent messages...")

    # Process recent 15 emails
    for msg_id in msg_ids[-15:]:
        res, data = mail.fetch(msg_id, "(RFC822)")
        if res != "OK":
            continue

        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject = decode_str(msg.get("Subject"))
        sender = decode_str(msg.get("From"))
        date_str = msg.get("Date")
        body = get_email_body(msg)

        print(f"\n[>] Ingesting: {subject}")
        print(f"    From: {sender}")

        payload = {
            "subject": subject,
            "sender": sender,
            "body": body,
            "receivedAt": date_str,
            "gmailMessageId": f"imap_{msg_id.decode()}"
        }

        try:
            resp = requests.post(WEBHOOK_URL, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                drive_name = data.get("data", {}).get("drive", {}).get("name", "Company")
                stage = data.get("data", {}).get("event", {}).get("eventType", "EVENT")
                print(f"    [SUCCESS] Linked to {drive_name} (Stage: {stage})")
            else:
                print(f"    [WARN] Server responded with code {resp.status_code}")
        except Exception as err:
            print(f"    [ERROR] Failed to post to local app: {err}")

    mail.close()
    mail.logout()
    print("\n[+] Sync complete! Check your Placement Tracker dashboard at http://localhost:3000")


if __name__ == "__main__":
    scan_and_sync_gmail()
