const dbNames = [
  'unbored',
  'unboredProfileEnv',
  'unboredGroupEnv',
  'unboredEventEnv',
  'unboredEventsEnv',
  'unboredAuthEnv',
  'unboredFriendsEnv',
];

for (let key in dbNames) {
  db = db.getSiblingDB(dbNames[key]);
  db.createUser({
    user: 'unboredUser',
    pwd: 'Lbd9DdMxjGkQq7CkL9DNx69JD9kxtR',
    roles: [{ role: 'readWrite', db: dbNames[key] }],
  });
}
