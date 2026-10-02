#!/usr/bin/env python3
"""
Deploy Durga Puja Song application to GitHub and enable GitHub Pages.
Uses the official GitHub REST API (v3) - zero external dependencies required.
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
from pathlib import Path

GITHUB_API = "https://api.github.com"
REPO_NAME = "durga-puja-song"
REPO_DESCRIPTION = "🌺 দুর্গাপূজার গান — Nostalgic Bengali Durga Puja Music & Radio Web Application"

EXCLUDE_DIRS = {".git", ".vscode", "durga-puja-song", "__pycache__", ".system_generated"}
EXCLUDE_FILES = {".env", "songs.json.bak", "deploy_to_github.py"}

def make_request(url, method="GET", token=None, data=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "DurgaPujaSong-Deployer"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="replace")
        try:
            err_json = json.loads(err_msg)
            return {"_error_status": e.code, "_error_message": err_json.get("message", err_msg)}
        except Exception:
            return {"_error_status": e.code, "_error_message": err_msg}

def deploy(token, target_user="snayonroy2018-bit"):
    print(f"[*] Verifying GitHub token for user {target_user}...")
    user_info = make_request(f"{GITHUB_API}/user", token=token)
    if "_error_status" in user_info:
        print(f"[!] Authentication failed: {user_info.get('_error_message')}")
        return False
    
    username = user_info.get("login")
    print(f"[+] Authenticated successfully as: {username}")
    
    # 1. Check if repo exists or create it
    print(f"[*] Checking repository {username}/{REPO_NAME}...")
    repo_info = make_request(f"{GITHUB_API}/repos/{username}/{REPO_NAME}", token=token)
    
    if "_error_status" in repo_info:
        if repo_info["_error_status"] == 404:
            print(f"[*] Repository does not exist. Creating repository {username}/{REPO_NAME}...")
            create_payload = {
                "name": REPO_NAME,
                "description": REPO_DESCRIPTION,
                "homepage": f"https://{username.lower()}.github.io/{REPO_NAME}/",
                "private": False,
                "has_issues": True,
                "has_projects": True,
                "has_wiki": False,
                "auto_init": False
            }
            create_resp = make_request(f"{GITHUB_API}/user/repos", method="POST", token=token, data=create_payload)
            if "_error_status" in create_resp:
                print(f"[!] Failed to create repo: {create_resp.get('_error_message')}")
                return False
            print(f"[+] Repository created: https://github.com/{username}/{REPO_NAME}")
        else:
            print(f"[!] Error fetching repository: {repo_info.get('_error_message')}")
            return False
    else:
        print(f"[+] Repository exists: https://github.com/{username}/{REPO_NAME}")

    # 2. Gather files to commit
    root_dir = Path(__file__).resolve().parent.parent
    files_to_upload = []
    
    for path in root_dir.rglob("*"):
        if path.is_file():
            rel_parts = path.relative_to(root_dir).parts
            # Skip excluded dirs
            if any(part in EXCLUDE_DIRS for part in rel_parts):
                continue
            if path.name in EXCLUDE_FILES or path.name.endswith(".pyc"):
                continue
            rel_path_str = "/".join(rel_parts)
            files_to_upload.append((path, rel_path_str))
            
    print(f"[*] Prepared {len(files_to_upload)} files for upload...")
    
    # 3. Create Git Blobs
    tree_items = []
    for idx, (fpath, rpath) in enumerate(files_to_upload, 1):
        try:
            with open(fpath, "rb") as f:
                content_b64 = base64.b64encode(f.read()).decode("utf-8")
        except Exception as e:
            print(f"[!] Error reading {rpath}: {e}")
            continue
            
        print(f"    [{idx}/{len(files_to_upload)}] Uploading blob: {rpath} ({fpath.stat().st_size} bytes)")
        blob_resp = make_request(
            f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/blobs",
            method="POST",
            token=token,
            data={"content": content_b64, "encoding": "base64"}
        )
        if "_error_status" in blob_resp:
            print(f"[!] Failed to create blob for {rpath}: {blob_resp.get('_error_message')}")
            return False
            
        tree_items.append({
            "path": rpath,
            "mode": "100644",
            "type": "blob",
            "sha": blob_resp["sha"]
        })

    # 4. Check for existing commit to use as parent
    ref_info = make_request(f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/ref/heads/main", token=token)
    parents = []
    if "_error_status" not in ref_info:
        parents.append(ref_info["object"]["sha"])

    # 5. Create Tree
    print(f"[*] Creating Git Tree with {len(tree_items)} items...")
    tree_resp = make_request(
        f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/trees",
        method="POST",
        token=token,
        data={"tree": tree_items}
    )
    if "_error_status" in tree_resp:
        print(f"[!] Failed to create tree: {tree_resp.get('_error_message')}")
        return False
    tree_sha = tree_resp["sha"]

    # 6. Create Commit
    print(f"[*] Creating Git Commit...")
    commit_payload = {
        "message": "🌺 Release: Complete Durga Puja Song nostalgic music web application",
        "tree": tree_sha,
        "parents": parents
    }
    commit_resp = make_request(
        f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/commits",
        method="POST",
        token=token,
        data=commit_payload
    )
    if "_error_status" in commit_resp:
        print(f"[!] Failed to create commit: {commit_resp.get('_error_message')}")
        return False
    commit_sha = commit_resp["sha"]

    # 7. Update or create ref 'main'
    print(f"[*] Updating main branch reference...")
    if parents:
        ref_update = make_request(
            f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/refs/heads/main",
            method="PATCH",
            token=token,
            data={"sha": commit_sha, "force": True}
        )
    else:
        ref_update = make_request(
            f"{GITHUB_API}/repos/{username}/{REPO_NAME}/git/refs",
            method="POST",
            token=token,
            data={"ref": "refs/heads/main", "sha": commit_sha}
        )
    if "_error_status" in ref_update:
        print(f"[!] Failed to update ref: {ref_update.get('_error_message')}")
        return False
    print(f"[+] Branch 'main' updated to commit {commit_sha[:7]}!")

    # 8. Enable GitHub Pages
    print(f"[*] Configuring GitHub Pages for {username}/{REPO_NAME}...")
    pages_resp = make_request(
        f"{GITHUB_API}/repos/{username}/{REPO_NAME}/pages",
        method="POST",
        token=token,
        data={"source": {"branch": "main", "path": "/"}}
    )
    if "_error_status" in pages_resp:
        # Check if already enabled
        if pages_resp.get("_error_status") in [409, 400]:
            print(f"[+] GitHub Pages is already configured.")
        else:
            print(f"[!] Notice regarding Pages setup: {pages_resp.get('_error_message')}")
    else:
        print(f"[+] GitHub Pages enabled successfully!")

    live_url = f"https://{username.lower()}.github.io/{REPO_NAME}/"
    repo_url = f"https://github.com/{username}/{REPO_NAME}"
    
    print("\n" + "=" * 60)
    print("🎉 DEPLOYMENT COMPLETE!")
    print(f"📦 Repository URL: {repo_url}")
    print(f"🌐 Live Website URL: {live_url}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    token = os.environ.get("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]
    
    if not token:
        print("Usage: python deploy_to_github.py <GITHUB_TOKEN>")
        print("Or set GITHUB_TOKEN environment variable.")
        sys.exit(1)
        
    deploy(token)
