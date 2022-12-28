CREATE DATABASE OpenBracket;

CREATE TABLE Events (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    CONSTRAINT PK_Events PRIMARY KEY (ID)
)

CREATE TABLE Games (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    TeamSize int NOT NULL,
    CONSTRAINT PK_Games PRIMARY KEY (ID)
)

CREATE TABLE GameModes (
    GameID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    Description varchar(1023),
    CONSTRAINT PK_GameModes PRIMARY KEY (GameID, ID)
)

CREATE TABLE StageFormats (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    PairingFxn varchar(255),
    CONSTRAINT PK_StageFormats PRIMARY KEY (ID)
)

CREATE TABLE MatchFormats (
    ID int NOT NULL AUTO_INCREMENT,
    Name varchar(255),
    SetCreationFxn varchar(255)
    CONSTRAINT PK_MatchFormats PRIMARY KEY (ID)
)

CREATE TABLE Tournaments (
    EventID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    GameID int NOT NULL,
    CONSTRAINT PK_Tournaments PRIMARY KEY (EventID, ID),
    CONSTRAINT FK_TournamentEvent FOREIGN KEY EventID REFERENCES Events(ID),
    CONSTRAINT FK_TournamentGame FOREIGN KEY GameID REFERENCES Games(ID)
)

CREATE TABLE Stages (
    EventID int NOT NULL,
    TournamentID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    FormatID int NOT NULL
    CONSTRAINT PK_Stages PRIMARY KEY (EventID, TournamentID, ID),
    CONSTRAINT FK_StageEvent FOREIGN KEY EventID REFERENCES Events(ID),
    CONSTRAINT FK_StageTournament FOREIGN KEY TournamentID REFERENCES Tournaments(ID),
    CONSTRAINT FK_StageFormat FOREIGN KEY FormatID REFERENCES StageFormats(ID)
)

CREATE TABLE Matches (
    EventID int NOT NULL,
    TournamentID int NOT NULL,
    StageID int NOT NULL,
    ID int NOT NULL AUTO_INCREMENT,
    FormatID int NOT NULL,
    CONSTRAINT PK_Matches PRIMARY KEY (EventID, TournamentID, StageID, ID),
    CONSTRAINT FK_MatchEvent FOREIGN KEY EventID REFERENCES Events(ID),
    CONSTRAINT FK_MatchTournament FOREIGN KEY TournamentID REFERENCES Tournaments(ID),
    CONSTRAINT FK_MatchStage FOREIGN KEY StageID REFERENCES Stages(ID),
    CONSTRAINT FK_MatchFormat FOREIGN KEY FormatID REFERENCES MatchFormats(ID)
)

