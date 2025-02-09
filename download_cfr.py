import os
import requests
import xml.etree.ElementTree as ET

def cfr_download(title_number):
    print(f"Downloading title-{title_number}.xml")

    url = f"https://www.ecfr.gov/api/versioner/v1/full/2025-02-06/title-{title_number}.xml"
    response = requests.get(url)

    if response.status_code == 200:
        with open(f"public_html/cfr/title-{title_number}.xml", "wb") as file:
            file.write(response.content)
    else:
        print(f"Failed to download title-{title_number}.xml")

def cfr_download_json(title_number):
    print(f"Downloading title-{title_number}.json")

    url = f"https://www.ecfr.gov/api/versioner/v1/structure/2025-02-06/title-{title_number}.json"
    response = requests.get(url)

    if response.status_code == 200:
        with open(f"public_html/cfr_json/title-{title_number}.json", "wb") as file:
            file.write(response.content)
    else:
        print(f"Failed to download title-{title_number}.json")

def cfr_corrections_download_json(title_number):
    print(f"Downloading title-{title_number}.json")

    url = f"https://www.ecfr.gov/api/admin/v1/corrections/title/{title_number}.json"
    response = requests.get(url)

    if response.status_code == 200:
        with open(f"public_html/cfr_corrections_json/corrections-{title_number}.json", "wb") as file:
            file.write(response.content)
    else:
        print(f"Failed to download corrections-{title_number}.json")

for i in range(1, 51):
    cfr_corrections_download_json(i)
    # cfr_download_json(i)
