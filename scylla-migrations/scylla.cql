CREATE KEYSPACE chat WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};

CREATE TABLE chat.messages (
  id TIMEUUID PRIMARY KEY,
  content TEXT,
  channel_id TEXT,
  thread_channel_id TEXT,
  author_id TEXT,
  reply_to_message_id TEXT,
  attached_files LIST<TEXT>,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE chat.messages_by_channel (
  channel_id TEXT,
  created_at TIMESTAMP,
  id TIMEUUID,
  PRIMARY KEY (channel_id, created_at, id)
) WITH CLUSTERING ORDER BY (created_at DESC, id DESC);

CREATE INDEX ON chat.messages (thread_channel_id);
CREATE INDEX ON chat.messages (reply_to_message_id);
