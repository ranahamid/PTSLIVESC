/****** Object:  Table [dbo].[TblClassroom]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblClassroom](
	[Id] [varchar](20) NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
	[SessionId] [nvarchar](1024) NOT NULL,
 CONSTRAINT [PK_TblClassroom] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[TblFC]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblFC](
	[Uid] [uniqueidentifier] NOT NULL,
	[ClassroomId] [varchar](20) NOT NULL,
	[Id] [varchar](20) NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
 CONSTRAINT [PK_TblFC] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[TblFCPC]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TblFCPC](
	[Uid] [uniqueidentifier] NOT NULL,
	[FcUid] [uniqueidentifier] NOT NULL,
	[PcUid] [uniqueidentifier] NOT NULL,
	[Volume] [int] NOT NULL,
	[Position] [int] NOT NULL,
 CONSTRAINT [PK_TblFCPC] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TblForm]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblForm](
	[Uid] [uniqueidentifier] NOT NULL,
	[ClassroomId] [varchar](20) NOT NULL,
	[Type] [int] NOT NULL,
	[Title] [nvarchar](256) NOT NULL,
	[Data] [ntext] NOT NULL,
 CONSTRAINT [PK_TblForm] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[TblFormAnswer]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TblFormAnswer](
	[Uid] [uniqueidentifier] NOT NULL,
	[FormUid] [uniqueidentifier] NOT NULL,
	[PcUid] [uniqueidentifier] NOT NULL,
	[Title] [nvarchar](256) NOT NULL,
	[Data] [ntext] NOT NULL,
	[Received] [datetime] NOT NULL,
	[Answered] [datetime] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK_TblFormAnswer] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TblPC]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblPC](
	[Uid] [uniqueidentifier] NOT NULL,
	[ClassroomId] [varchar](20) NOT NULL,
	[Id] [varchar](20) NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
	[ScUid] [uniqueidentifier] NULL,
	[TcUid] [uniqueidentifier] NULL,
	[Position] [int] NOT NULL,
	[Audio] [bit] NOT NULL,
	[Video] [bit] NOT NULL,
	[Volume1] [int] NOT NULL,
	[Volume2] [int] NOT NULL,
 CONSTRAINT [PK_TblPC_1] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[TblSC]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblSC](
	[Uid] [uniqueidentifier] NOT NULL,
	[ClassroomId] [varchar](20) NOT NULL,
	[Id] [varchar](20) NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
	[Audio] [bit] NOT NULL,
	[Video] [bit] NOT NULL,
	[Volume1] [int] NOT NULL,
	[Volume2] [int] NOT NULL,
	[Volume3] [int] NOT NULL,
	[Volume4] [int] NOT NULL,
	[Volume5] [int] NOT NULL,
	[Volume6] [int] NOT NULL,
	[Volume7] [int] NOT NULL,
	[Volume8] [int] NOT NULL,
 CONSTRAINT [PK_TblSC_1] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[TblTC]    Script Date: 25.08.2016 1:37:56 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[TblTC](
	[Uid] [uniqueidentifier] NOT NULL,
	[ClassroomId] [varchar](20) NOT NULL,
	[Id] [varchar](20) NOT NULL,
	[Name] [nvarchar](256) NOT NULL,
	[Audio] [bit] NOT NULL,
	[Video] [bit] NOT NULL,
 CONSTRAINT [PK_TblTC_1] PRIMARY KEY CLUSTERED 
(
	[Uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [dbo].[TblFC]  WITH CHECK ADD  CONSTRAINT [FK_TblFC_TblClassroom] FOREIGN KEY([ClassroomId])
REFERENCES [dbo].[TblClassroom] ([Id])
GO
ALTER TABLE [dbo].[TblFC] CHECK CONSTRAINT [FK_TblFC_TblClassroom]
GO
ALTER TABLE [dbo].[TblFCPC]  WITH CHECK ADD  CONSTRAINT [FK_TblFCPC_TblFC] FOREIGN KEY([FcUid])
REFERENCES [dbo].[TblFC] ([Uid])
GO
ALTER TABLE [dbo].[TblFCPC] CHECK CONSTRAINT [FK_TblFCPC_TblFC]
GO
ALTER TABLE [dbo].[TblFCPC]  WITH CHECK ADD  CONSTRAINT [FK_TblFCPC_TblPC] FOREIGN KEY([PcUid])
REFERENCES [dbo].[TblPC] ([Uid])
GO
ALTER TABLE [dbo].[TblFCPC] CHECK CONSTRAINT [FK_TblFCPC_TblPC]
GO
ALTER TABLE [dbo].[TblForm]  WITH CHECK ADD  CONSTRAINT [FK_TblForm_TblClassroom] FOREIGN KEY([ClassroomId])
REFERENCES [dbo].[TblClassroom] ([Id])
GO
ALTER TABLE [dbo].[TblForm] CHECK CONSTRAINT [FK_TblForm_TblClassroom]
GO
ALTER TABLE [dbo].[TblFormAnswer]  WITH CHECK ADD  CONSTRAINT [FK_TblFormAnswer_TblForm] FOREIGN KEY([FormUid])
REFERENCES [dbo].[TblForm] ([Uid])
GO
ALTER TABLE [dbo].[TblFormAnswer] CHECK CONSTRAINT [FK_TblFormAnswer_TblForm]
GO
ALTER TABLE [dbo].[TblFormAnswer]  WITH CHECK ADD  CONSTRAINT [FK_TblFormAnswer_TblPC] FOREIGN KEY([PcUid])
REFERENCES [dbo].[TblPC] ([Uid])
GO
ALTER TABLE [dbo].[TblFormAnswer] CHECK CONSTRAINT [FK_TblFormAnswer_TblPC]
GO
ALTER TABLE [dbo].[TblPC]  WITH CHECK ADD  CONSTRAINT [FK_TblPC_TblClassroom] FOREIGN KEY([ClassroomId])
REFERENCES [dbo].[TblClassroom] ([Id])
GO
ALTER TABLE [dbo].[TblPC] CHECK CONSTRAINT [FK_TblPC_TblClassroom]
GO
ALTER TABLE [dbo].[TblPC]  WITH CHECK ADD  CONSTRAINT [FK_TblPC_TblSC] FOREIGN KEY([ScUid])
REFERENCES [dbo].[TblSC] ([Uid])
GO
ALTER TABLE [dbo].[TblPC] CHECK CONSTRAINT [FK_TblPC_TblSC]
GO
ALTER TABLE [dbo].[TblPC]  WITH CHECK ADD  CONSTRAINT [FK_TblPC_TblTC] FOREIGN KEY([TcUid])
REFERENCES [dbo].[TblTC] ([Uid])
GO
ALTER TABLE [dbo].[TblPC] CHECK CONSTRAINT [FK_TblPC_TblTC]
GO
ALTER TABLE [dbo].[TblSC]  WITH CHECK ADD  CONSTRAINT [FK_TblSC_TblClassroom] FOREIGN KEY([ClassroomId])
REFERENCES [dbo].[TblClassroom] ([Id])
GO
ALTER TABLE [dbo].[TblSC] CHECK CONSTRAINT [FK_TblSC_TblClassroom]
GO
ALTER TABLE [dbo].[TblTC]  WITH CHECK ADD  CONSTRAINT [FK_TblTC_TblClassroom] FOREIGN KEY([ClassroomId])
REFERENCES [dbo].[TblClassroom] ([Id])
GO
ALTER TABLE [dbo].[TblTC] CHECK CONSTRAINT [FK_TblTC_TblClassroom]
GO
