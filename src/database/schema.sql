-- 1. Instances
CREATE TABLE instances (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Groups
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    instance_id INT REFERENCES instances(id) ON DELETE CASCADE,
    whatsapp_group_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    whatsapp_user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Group Members
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 5. Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    whatsapp_message_id TEXT UNIQUE NOT NULL,
    content TEXT,
    type TEXT CHECK (type IN ('text', 'image', 'video', 'audio', 'other')) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Reactions
CREATE TABLE reactions (
    id SERIAL PRIMARY KEY,
    message_id INT REFERENCES messages(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- 7. Events (generic group events: joins, leaves, admin changes, etc.)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Whitelist
CREATE TABLE whitelist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 9. Removal Queue
CREATE TABLE removal_queue (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT CHECK (status IN ('pending', 'processed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 10. Actions Audio
CREATE TABLE actions_audio (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Activity Daily (aggregated stats for analysis)
CREATE TABLE activity_daily (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_count INT DEFAULT 0,
    reactions_count INT DEFAULT 0,
    events_count INT DEFAULT 0,
    UNIQUE(group_id, user_id, date)
);
