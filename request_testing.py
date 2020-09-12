import requests, json

url = "http://localhost:8888/request"


headers = {'Content-Type': "application/json", 'Accept': "application/json"}
response = requests.get(url, headers = headers, json = {'ticker': 'AAL'})
print(response.json())
