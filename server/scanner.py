import sys
import os
import hashlib
import json
import subprocess
import pefile  

def calculate_hash(file_path):
    """Calculates the SHA256 hash of the file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def extract_strings(file_path):
    """Extracts printable ASCII strings from the file."""
    strings = []
    with open(file_path, "rb") as f:
        content = f.read()
        for i in range(len(content)):
            for j in range(i + 4, min(len(content), i + 128)):
                if all(32 <= byte < 127 for byte in content[i:j]):
                    strings.append(content[i:j].decode("latin-1"))
    return strings

def run_yara_command(file_path, rules_path):
    """Matches the file against Yara rules using the command-line tool."""
    try:
        result = subprocess.run(['yara64.exe', rules_path, file_path], capture_output=True, text=True)
        output_lines = result.stdout.strip().split('\n')
        matches = [line.split()[0] for line in output_lines if line]
        return matches
    except FileNotFoundError:
        return ["Error: Yara executable or rules file not found."]

def run_clamscan(file_path):
    """Scans the file with ClamAV."""
    try:
        result = subprocess.run(['clamscan', '--no-summary', file_path], capture_output=True, text=True)
        output = result.stdout.strip()
        if "FOUND" in output:
            return ["Malware Found"]
        else:
            return ["Clean"]
    except FileNotFoundError:
        return ["Error: ClamAV not found."]

def analyze_pe(file_path):
    """Analyzes PE files to extract imports and other metadata."""
    try:
        pe = pefile.PE(file_path)
        imports = [import_entry.name.decode("utf-8") for dll in pe.DIRECTORY_ENTRY_IMPORT for import_entry in dll.imports]
        # Extract more PE information if needed (e.g., sections, resources)
        return {"imports": imports}
    except pefile.PEFormatError:
        return {"desc": "Not a PE file"}

def analyze_file_type(file_path):
    """
    Basic file type analysis using the `file` command.
    This is platform-dependent and might not be very accurate.
    """
    try:
        result = subprocess.run(['file', file_path], capture_output=True, text=True)
        return result.stdout.strip()
    except FileNotFoundError:
        return "Error: 'file' command not found."

def perform_scan(file_path, file_name, yara_rules_path="malware_rules.yar"):
    """Performs static analysis on the file."""
    results = {}
    results["file_name"] = file_name
    results["sha256"] = calculate_hash(file_path)
    results["strings"] = extract_strings(file_path)
    results["yara_matches"] = run_yara_command(file_path, yara_rules_path)
    results["clamav_scan"] = run_clamscan(file_path)
    results["pe_analysis"] = analyze_pe(file_path)
    results["file_type_info"] = analyze_file_type(file_path)

    # Add more analysis here (e.g., check for suspicious API calls in imports)

    # Basic malware detection logic (example):
    if (
        results["yara_matches"] or
        (results["pe_analysis"] and any("malicious_api_call" in imp for imp in results["pe_analysis"].get("imports", []))) or
        "Malware Found" in results["clamav_scan"]
    ):
        results["malicious"] = True
    else:
        results["malicious"] = False

    return json.dumps(results, indent=4) #added indent for better readability.

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <file_path> <file_name>")
        sys.exit(1)

    file_path = sys.argv[1]
    file_name = sys.argv[2]
    print(perform_scan(file_path, file_name))