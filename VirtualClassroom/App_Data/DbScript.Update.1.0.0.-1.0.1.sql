/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
EXECUTE sp_rename N'dbo.TblPC.Volume1', N'Tmp_Volume', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.TblPC.Tmp_Volume', N'Volume', 'COLUMN' 
GO
ALTER TABLE dbo.TblPC
	DROP COLUMN Volume2
GO
ALTER TABLE dbo.TblPC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
GO
UPDATE dbo.TblPC SET Volume = 80
GO


/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
EXECUTE sp_rename N'dbo.TblSC.Volume1', N'Tmp_Volume_2', 'COLUMN' 
GO
EXECUTE sp_rename N'dbo.TblSC.Tmp_Volume_2', N'Volume', 'COLUMN' 
GO
ALTER TABLE dbo.TblSC
	DROP COLUMN Volume2, Volume3, Volume4, Volume5, Volume6, Volume7, Volume8
GO
ALTER TABLE dbo.TblSC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
UPDATE dbo.TblSC SET Volume = 80
GO


/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.TblTC ADD
	Volume int NULL
GO
ALTER TABLE dbo.TblTC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
UPDATE dbo.TblTC SET Volume = 80
GO
/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.TblTC
	DROP CONSTRAINT FK_TblTC_TblClassroom
GO
ALTER TABLE dbo.TblClassroom SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_TblTC
	(
	Uid uniqueidentifier NOT NULL,
	ClassroomId varchar(20) NOT NULL,
	Id varchar(20) NOT NULL,
	Name nvarchar(256) NOT NULL,
	Audio bit NOT NULL,
	Video bit NOT NULL,
	Volume int NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_TblTC SET (LOCK_ESCALATION = TABLE)
GO
IF EXISTS(SELECT * FROM dbo.TblTC)
	 EXEC('INSERT INTO dbo.Tmp_TblTC (Uid, ClassroomId, Id, Name, Audio, Video, Volume)
		SELECT Uid, ClassroomId, Id, Name, Audio, Video, Volume FROM dbo.TblTC WITH (HOLDLOCK TABLOCKX)')
GO
ALTER TABLE dbo.TblPC
	DROP CONSTRAINT FK_TblPC_TblTC
GO
DROP TABLE dbo.TblTC
GO
EXECUTE sp_rename N'dbo.Tmp_TblTC', N'TblTC', 'OBJECT' 
GO
ALTER TABLE dbo.TblTC ADD CONSTRAINT
	PK_TblTC_1 PRIMARY KEY CLUSTERED 
	(
	Uid
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.TblTC ADD CONSTRAINT
	FK_TblTC_TblClassroom FOREIGN KEY
	(
	ClassroomId
	) REFERENCES dbo.TblClassroom
	(
	Id
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.TblPC ADD CONSTRAINT
	FK_TblPC_TblTC FOREIGN KEY
	(
	TcUid
	) REFERENCES dbo.TblTC
	(
	Uid
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
ALTER TABLE dbo.TblPC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
GO

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.TblSC
	DROP COLUMN Audio, Video, Volume
GO
ALTER TABLE dbo.TblSC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
GO

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.TblFCPC
	DROP COLUMN Volume
GO
ALTER TABLE dbo.TblFCPC SET (LOCK_ESCALATION = TABLE)
GO
COMMIT


/* To Default volume/audio/video states */
UPDATE dbo.TblPC SET Audio = 0, Video = 1, Volume = 80
GO
UPDATE dbo.TblTC SET Audio = 1, Video = 1, Volume = 80
GO


