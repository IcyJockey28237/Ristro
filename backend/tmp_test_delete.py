import requests

# get token
r1 = requests.post("http://localhost:8000/api/auth/login", json={"email": "final@example.com", "password": "Password123!"})
try:
    token = r1.json()["access_token"]
    print("Token fetched")
except:
    print("Login failed", r1.text)
    exit(1)

# do delete
r2 = requests.delete("http://localhost:8000/api/menu/1", headers={"Authorization": f"Bearer {token}"})
print("Delete status:", r2.status_code)
print("Delete body:", r2.text)
