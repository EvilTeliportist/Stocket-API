import requests

url = 'http://localhost:8888/update'
h = '7A6ECCDB792062797AA4F6BEE12199219EC8749641BA50B3138DD4857A65173D'
data = {'MSFT': {'test':1}}
headers = {'Content-Type': "application/json", 'Accept': "application/json"}
response = requests.post(url, headers = headers, json = {'hash':h, 'data': data})
print(response)