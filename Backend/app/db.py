from typing import List, Optional, Dict
from .models import User, LeaderboardEntry, GameMode
import time

class MockDB:
    def __init__(self):
        self.users: Dict[str, User] = {}  # email -> User
        self.users_by_id: Dict[str, User] = {} # id -> User
        self.passwords: Dict[str, str] = {} # email -> password
        self.leaderboard: List[LeaderboardEntry] = []
        
        # Add some dummy data
        self._add_dummy_data()

    def _add_dummy_data(self):
        # Demo user
        demo_user = User(id="user_1", username="DemoUser", email="demo@example.com")
        self.users["demo@example.com"] = demo_user
        self.users_by_id["user_1"] = demo_user
        self.passwords["demo@example.com"] = "password123"
        
        self.leaderboard.append(LeaderboardEntry(
            id="entry_1", 
            username="DemoUser", 
            score=100, 
            mode=GameMode.pass_through, 
            timestamp=int(time.time() * 1000)
        ))

    def create_user(self, user: User, password: str) -> User:
        if user.email in self.users:
            raise ValueError("User already exists")
        self.users[user.email] = user
        self.users_by_id[user.id] = user
        self.passwords[user.email] = password
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users.get(email)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users_by_id.get(user_id)

    def verify_password(self, email: str, password: str) -> bool:
        return self.passwords.get(email) == password

    def add_score(self, entry: LeaderboardEntry):
        self.leaderboard.append(entry)
        # Keep sorted by score desc
        self.leaderboard.sort(key=lambda x: x.score, reverse=True)

    def get_leaderboard(self) -> List[LeaderboardEntry]:
        return self.leaderboard

# Global instance
db = MockDB()
