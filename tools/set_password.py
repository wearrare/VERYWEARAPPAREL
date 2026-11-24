#!/usr/bin/env python3
"""Sets the site password. Usage:  python3 tools/set_password.py "the password"
Writes the hashed password into config.js (the password itself is never stored).
Use  python3 tools/set_password.py --off  to turn the password screen off."""
import hashlib, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = os.path.join(ROOT, "config.js")
src = open(cfg, encoding="utf-8").read()
m = re.search(r'salt:\s*"([^"]*)"', src)
salt = m.group(1) if m else "wear-rare"
if len(sys.argv) < 2:
    sys.exit(__doc__)
if sys.argv[1] == "--off":
    h = ""
else:
    h = hashlib.pbkdf2_hmac("sha256", sys.argv[1].strip().encode(), salt.encode(), 200000, 32).hex()
new, n = re.subn(r'passwordHash:\s*"[^"]*"', f'passwordHash: "{h}"', src)
if n != 1:
    sys.exit("passwordHash line not found in config.js")
open(cfg, "w", encoding="utf-8").write(new)
print("password screen OFF" if not h else "password set. Commit config.js to publish.")
