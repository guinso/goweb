CREATE TABLE account(
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    pwd TEXT
);

CREATE TABLE role(
    id TEXT PRIMARY KEY,
    name TEXT
);

create TABLE account_role(
    id TEXT PRIMARY KEY,
    account_id TEXT,
    role_id TEXT,
    FOREIGN KEY (account_id) REFERENCES account (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE access_group(
    id TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE access(
    id TEXT PRIMARY KEY,
    name TEXT,
    group_id TEXT,
    FOREIGN KEY (group_id) REFERENCES access_group (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE role_access(
    id TEXT PRIMARY KEY,
    access_id TEXT,
    role_id TEXT,
    is_authorize INTEGER,
    FOREIGN KEY (access_id) REFERENCES access (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE login_session(
    id TEXT PRIMARY KEY,
    account_id TEXT,
    hash_key TEXT,
    login TEXT,
    logout TEXT,
    last_seen TEXT,
    FOREIGN KEY (account_id) REFERENCES account (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);