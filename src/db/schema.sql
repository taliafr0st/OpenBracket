CREATE DATABASE OpenBracket;
USE OpenBracket;

CREATE TABLE Participants (
    ID int NOT NULL AUTO_INCREMENT,
    CONSTRAINT PK_Participants PRIMARY KEY (ID)
);

CREATE TABLE Users (
    ID int NOT NULL,
    Name varchar(63) NOT NULL,
    Email varchar(255) NOT NULL,
    Password varchar(255) NOT NULL,
    Discord varchar(63),
    Twitter varchar(63),
    TwoFA varchar(15),
    CONSTRAINT PK_Users PRIMARY KEY (ID),
    CONSTRAINT FK_Users FOREIGN KEY (ID) REFERENCES Participants(ID)
);

CREATE TABLE Teams (
    ID int NOT NULL,
    Name varchar(63) NOT NULL,
    OwnerID int NOT NULL,
    Twitter varchar(63),
    CONSTRAINT PK_Teams PRIMARY KEY (ID),
    CONSTRAINT FK_Teams FOREIGN KEY (ID) REFERENCES Participants(ID),
    CONSTRAINT FK_TeamOwner FOREIGN KEY (OwnerID) REFERENCES Users(ID)
);

CREATE TABLE Organisers (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(63) NOT NULL,
    Discord varchar(63),
    Twitter varchar(63),
    OwnerID int NOT NULL,
    CONSTRAINT PK_Orgs PRIMARY KEY (ID),
    CONSTRAINT FK_OrgOwner FOREIGN KEY (OwnerID) REFERENCES Users(ID)
);

CREATE TABLE OrgMembers (
    OrgID int NOT NULL,
    MemberID int NOT NULL,
    CONSTRAINT PK_OrgMembers PRIMARY KEY (OrgID, MemberID),
    CONSTRAINT FK_OMOrg FOREIGN KEY (OrgID) REFERENCES Organisers(ID),
    CONSTRAINT FK_OMMember FOREIGN KEY (MemberID) REFERENCES Users(ID)
);

CREATE TABLE Titles (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    TeamSize int NOT NULL,
    CONSTRAINT PK_Titles PRIMARY KEY (ID)
);

CREATE TABLE GameModes (
    TitleID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    Description varchar(1023),
    CONSTRAINT PK_GameModes PRIMARY KEY (ID),
    CONSTRAINT FK_GameModeTitle FOREIGN KEY (TitleID) REFERENCES Titles(ID)
);

CREATE TABLE Maps (
    TitleID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    CONSTRAINT PK_Maps PRIMARY KEY (ID),
    CONSTRAINT FK_MapTitle FOREIGN KEY (TitleID) REFERENCES Titles(ID)
);

CREATE TABLE Events (
    ID int NOT NULL AUTO_INCREMENT,
    OwnerID int NOT NULL,
    OrgID int NOT NULL,
    Name varchar(255),
    CONSTRAINT PK_Events PRIMARY KEY (ID),
    CONSTRAINT FK_EventOwner FOREIGN KEY (OwnerID) REFERENCES Users(ID),
    CONSTRAINT FK_EventOrg FOREIGN KEY (OrgID) REFERENCES Organisers(ID)
);

CREATE TABLE EventsAdmins (
    EventID int NOT NULL,
    AdminID int NOT NULL,
    CONSTRAINT PK_Admins PRIMARY KEY (EventID, AdminID),
    CONSTRAINT FK_AdminEvent FOREIGN KEY (EventID) REFERENCES Events(ID),
    CONSTRAINT FK_AdminPerson FOREIGN KEY (AdminID) REFERENCES Users(ID)
);

CREATE TABLE Tournaments (
    EventID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    TitleID int NOT NULL,
    CONSTRAINT PK_Tournaments PRIMARY KEY (ID),
    CONSTRAINT FK_TournamentEvent FOREIGN KEY (EventID) REFERENCES Events(ID),
    CONSTRAINT FK_TournamentTitle FOREIGN KEY (TitleID) REFERENCES Titles(ID)
);

CREATE TABLE StageFormats (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    PairingFxn varchar(255),
    ScoringFxn varchar(255),
    CONSTRAINT PK_StageFormats PRIMARY KEY (ID)
);

CREATE TABLE Stages (
    TournamentID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    FormatID int NOT NULL,
    CONSTRAINT PK_Stages PRIMARY KEY (ID),
    CONSTRAINT FK_StageTournament FOREIGN KEY (TournamentID) REFERENCES Tournaments(ID),
    CONSTRAINT FK_StageFormat FOREIGN KEY (FormatID) REFERENCES StageFormats(ID)
);

CREATE TABLE StageProgressions (
    StageID int NOT NULL,
    NextStageID int NOT NULL,
    Priority int NOT NULL,
    ProgressionCount int DEFAULT 1 NOT NULL,
    CONSTRAINT PK_StageProgressions PRIMARY KEY (StageID, Priority),
    CONSTRAINT FK_SPStage FOREIGN KEY (StageID) REFERENCES Stages(ID),
    CONSTRAINT FK_SPNextStage FOREIGN KEY (NextStageID) REFERENCES Stages(ID)
);

CREATE TABLE MatchFormats (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    SetCreationFxn varchar(255),
    ScoringFxn varchar(255),
    CONSTRAINT PK_MatchFormats PRIMARY KEY (ID)
);

CREATE TABLE Matches (
    StageID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    FormatID int NOT NULL,
    CONSTRAINT PK_Matches PRIMARY KEY (ID),
    CONSTRAINT FK_MatchStage FOREIGN KEY (StageID) REFERENCES Stages(ID),
    CONSTRAINT FK_MatchFormat FOREIGN KEY (FormatID) REFERENCES MatchFormats(ID)
);

CREATE TABLE MatchProgressions (
    MatchID int NOT NULL,
    NextMatchID int NOT NULL,
    Priority int NOT NULL,
    ProgressionCount int DEFAULT 1 NOT NULL,
    CONSTRAINT PK_MatchProgressions PRIMARY KEY (MatchID, Priority),
    CONSTRAINT FK_MPMatch FOREIGN KEY (MatchID) REFERENCES Matches(ID),
    CONSTRAINT FK_MPNextMatch FOREIGN KEY (NextMatchID) REFERENCES Matches(ID)
);

CREATE TABLE SetFormats (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    GameCreationFxn varchar(255),
    ScoringFxn varchar(255),
    CONSTRAINT PK_MatchFormats PRIMARY KEY (ID)
);

CREATE TABLE Sets (
    MatchID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    FormatID int NOT NULL,
    CONSTRAINT PK_Sets PRIMARY KEY (ID),
    CONSTRAINT FK_SetMatch FOREIGN KEY (MatchID) REFERENCES Matches(ID),
    CONSTRAINT FK_SetFormat FOREIGN KEY (FormatID) REFERENCES SetFormats(ID)
);

CREATE TABLE Games (
    SetID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    GameModeID int NOT NULL,
    MapID int NOT NULL,
    CONSTRAINT PK_Games PRIMARY KEY (ID),
    CONSTRAINT FK_GameSet FOREIGN KEY (SetID) REFERENCES Sets(ID),
    CONSTRAINT FK_GameMode FOREIGN KEY (GameModeID) REFERENCES GameModes(ID),
    CONSTRAINT FK_GameMap FOREIGN KEY (MapID) REFERENCES Maps(ID)
);

CREATE TABLE GameScores (
    GameID int NOT NULL,
    ParticipantID int NOT NULL,
    Score int NOT NULL DEFAULT 0,
    CONSTRAINT PK_GScores PRIMARY KEY (GameID, ParticipantID),
    CONSTRAINT FK_GSGame FOREIGN KEY (GameID) REFERENCES Games(ID),
    CONSTRAINT FK_GSParticipant FOREIGN KEY (ParticipantID) REFERENCES Participants(ID)
);