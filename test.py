from pystocket import Stocket

stocket = Stocket('<your token here>')

print(stocket.get('MSFT', '2020-09-17 09:38', '2020-09-17 09:50'))
