CREATE TABLE participants (
    gid int NOT NULL AUTO_INCREMENT,
    CONSTRAINT pk_participants PRIMARY KEY (gid)
);

CREATE TABLE users (
    gid int NOT NULL,
    username varchar(63) NOT NULL UNIQUE,
    displayname varchar(63) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    discord varchar(63),
    twitter varchar(63),
    twofa varchar(15),
    CONSTRAINT pk_users PRIMARY KEY (gid),
    CONSTRAINT fk_users FOREIGN KEY (gid) REFERENCES participants(gid)
);

CREATE TABLE teams (
    gid int NOT NULL,
    name varchar(63) NOT NULL,
    owner_gid int NOT NULL,
    twitter varchar(63),
    CONSTRAINT pk_teams PRIMARY KEY (gid),
    CONSTRAINT fk_teams FOREIGN KEY (gid) REFERENCES participants(gid),
    CONSTRAINT fk_teams_owner FOREIGN KEY (owner_gid) REFERENCES users(gid)
);

CREATE TABLE organisers (
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(63) NOT NULL,
    discord varchar(63),
    twitter varchar(63),
    owner_gid int NOT NULL,
    CONSTRAINT pk_orgs PRIMARY KEY (gid),
    CONSTRAINT fk_orgs_owner FOREIGN KEY (owner_gid) REFERENCES users(gid)
);

CREATE TABLE org_members (
    org_gid int NOT NULL,
    member_gid int NOT NULL,
    CONSTRAINT pk_org_members PRIMARY KEY (org_gid, member_gid),
    CONSTRAINT fk_org_members_org FOREIGN KEY (org_gid) REFERENCES organisers(gid),
    CONSTRAINT fk_org_members_member FOREIGN KEY (member_gid) REFERENCES users(gid)
);

CREATE TABLE titles (
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    team_size int NOT NULL,
    CONSTRAINT pk_titles PRIMARY KEY (gid)
);

CREATE TABLE game_modes (
    title_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    description varchar(1023),
    CONSTRAINT pk_game_modes PRIMARY KEY (gid),
    CONSTRAINT fk_game_modes_title FOREIGN KEY (title_gid) REFERENCES titles(gid)
);

CREATE TABLE maps (
    title_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    CONSTRAINT pk_maps PRIMARY KEY (gid),
    CONSTRAINT fk_maps_title FOREIGN KEY (title_gid) REFERENCES titles(gid)
);

CREATE TABLE events (
    gid int NOT NULL AUTO_INCREMENT,
    owner_gid int NOT NULL,
    org_gid int,
    name varchar(255),
    CONSTRAINT pk_events PRIMARY KEY (gid),
    CONSTRAINT fk_events_owner FOREIGN KEY (owner_gid) REFERENCES users(gid),
    CONSTRAINT fk_events_org FOREIGN KEY (org_gid) REFERENCES organisers(gid)
);

CREATE TABLE event_admins (
    event_gid int NOT NULL,
    admin_gid int NOT NULL,
    CONSTRAINT pk_admins PRIMARY KEY (event_gid, admin_gid),
    CONSTRAINT fk_admins_event FOREIGN KEY (event_gid) REFERENCES events(gid),
    CONSTRAINT fk_admins_person FOREIGN KEY (admin_gid) REFERENCES users(gid)
);

CREATE TABLE tournaments (
    event_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    title_gid int NOT NULL,
    CONSTRAINT pk_tournaments PRIMARY KEY (gid),
    CONSTRAINT fk_tournaments_event FOREIGN KEY (event_gid) REFERENCES events(gid),
    CONSTRAINT fk_tournaments_title FOREIGN KEY (title_gid) REFERENCES titles(gid)
);

CREATE TABLE stage_formats (
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    pairing_fxn varchar(255),
    scoring_fxn varchar(255),
    CONSTRAINT pk_stage_formats PRIMARY KEY (gid)
);

CREATE TABLE stages (
    tournament_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    format_gid int NOT NULL,
    CONSTRAINT pk_stages PRIMARY KEY (gid),
    CONSTRAINT fk_stages_tournament FOREIGN KEY (tournament_gid) REFERENCES tournaments(gid),
    CONSTRAINT fk_stages_format FOREIGN KEY (format_gid) REFERENCES stage_formats(gid)
);

CREATE TABLE stage_progressions (
    stage_gid int NOT NULL,
    next_stage_gid int NOT NULL,
    priority int NOT NULL,
    progression_count int DEFAULT 1 NOT NULL,
    CONSTRAINT pk_stage_progressions PRIMARY KEY (stage_gid, priority),
    CONSTRAINT fk_stage_progressions_stage FOREIGN KEY (stage_gid) REFERENCES stages(gid),
    CONSTRAINT fk_stage_progressions_next_stage FOREIGN KEY (nextstage_gid) REFERENCES stages(gid)
);

CREATE TABLE match_formats (
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    set_creation_fxn varchar(255),
    scoring_fxn varchar(255),
    CONSTRAINT pk_match_formats PRIMARY KEY (gid)
);

CREATE TABLE matches (
    stage_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    format_gid int NOT NULL,
    CONSTRAINT pk_matches PRIMARY KEY (gid),
    CONSTRAINT fk_matches_stage FOREIGN KEY (stage_gid) REFERENCES stages(gid),
    CONSTRAINT fk_matches_format FOREIGN KEY (format_gid) REFERENCES match_formats(gid)
);

CREATE TABLE match_progressions (
    match_gid int NOT NULL,
    next_match_gid int NOT NULL,
    priority int NOT NULL,
    progression_count int DEFAULT 1 NOT NULL,
    CONSTRAINT pk_match_progressions PRIMARY KEY (match_gid, priority),
    CONSTRAINT fk_match_progressions_match FOREIGN KEY (match_gid) REFERENCES matches(gid),
    CONSTRAINT fk_match_progressions_nextmatch FOREIGN KEY (next_match_gid) REFERENCES matches(gid)
);

CREATE TABLE set_formats (
    gid int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    game_creation_fxn varchar(255),
    scoring_fxn varchar(255),
    CONSTRAINT pk_set_formats PRIMARY KEY (gid)
);

CREATE TABLE sets (
    match_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    format_gid int NOT NULL,
    CONSTRAINT pk_sets PRIMARY KEY (gid),
    CONSTRAINT fk_sets_match FOREIGN KEY (match_gid) REFERENCES matches(gid),
    CONSTRAINT fk_sets_format FOREIGN KEY (format_gid) REFERENCES set_formats(gid)
);

CREATE TABLE games (
    set_gid int NOT NULL,
    gid int NOT NULL AUTO_INCREMENT,
    gamemode_gid int NOT NULL,
    map_gid int NOT NULL,
    CONSTRAINT pk_games PRIMARY KEY (gid),
    CONSTRAINT fk_games_set FOREIGN KEY (set_gid) REFERENCES sets(gid),
    CONSTRAINT fk_games_mode FOREIGN KEY (gamemode_gid) REFERENCES game_modes(gid),
    CONSTRAINT fk_games_map FOREIGN KEY (map_gid) REFERENCES maps(gid)
);

CREATE TABLE game_scores (
    game_gid int NOT NULL,
    participant_gid int NOT NULL,
    score int NOT NULL DEFAULT 0,
    CONSTRAINT pk_game_scores PRIMARY KEY (game_gid, participant_gid),
    CONSTRAINT fk_game_scores_game FOREIGN KEY (game_gid) REFERENCES games(gid),
    CONSTRAINT fk_game_scores_participant FOREIGN KEY (participant_gid) REFERENCES participants(gid)
);
