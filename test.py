import requests

# Make requests and get server response
url = "https://rtstockdata.azurewebsites.net/dividends"
headers = {'Content-Type': "application/json", 'Accept': "application/json"}
response = requests.get(url, headers=headers, json={'token': 'UkV3i6ovBjVXI8bjeD4px8PSdQJR2VuVRyKl9CgE'})

print(response.json()['message'])