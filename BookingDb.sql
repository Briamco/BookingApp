create database BookingDb
use BookingDb

create table Users
(
	id uniqueidentifier default newid() primary key,
	first_name nvarchar(50) not null,
	last_name nvarchar(50) not null,
	
	email nvarchar(255) not null unique
		constraint ck_user_email check (email like '%_@__%.__%'),
	
	phone nvarchar(12) not null unique
		constraint ck_user_phone check (phone like '8_9-___-____'),
	
	password_hash nvarchar(100) not null,
	is_confirmed bit default 0,
	confirmation_token nvarchar(max),
	token_expires_at datetime

)

create table Properties
(
	id int primary key identity(1,1),
	[host_id] uniqueidentifier not null,
	title nvarchar(50) not null,
	[description] nvarchar(max) not null,
	latitude decimal(8,6) not null,
	longitude decimal(9,6) not null,
	city nvarchar(100) not null,
	[state] nvarchar(100) not null,
	country nvarchar(100) not null,
	night_price money not null
		constraint ck_property_night_price check (night_price > 0),
	
	capacity int not null
		constraint ck_property_capacity check (capacity > 0)

	constraint fk_property_host foreign key ([host_id]) references Users(id)
)

create table Images
(
	id int primary key identity(1,1),
	property_id int not null,
	[url] nvarchar(max) not null,
	[order] int not null

	constraint fk_image_property foreign key (property_id) references Properties(id),
)

create table Reservations
(
	id int primary key identity(1,1),
	property_id int not null,
	guest_id uniqueidentifier not null,
	[start_date] date not null,
	end_date date not null,
	[status] nvarchar(20) not null
		constraint df_reservation_staus default 'Confirmed',
		constraint ck_reservation_status check([status] in ('Confirmed', 'Canceled', 'Completed')),

	created_at datetime2 default getutcdate(),

	constraint fk_reservation_property foreign key (property_id) references Properties(id),
	constraint fk_reservation_guest foreign key (guest_id) references Users(id),
)

create table BloquedDates
(
	id int primary key identity(1,1),
	property_id int not null,
	[start_date] date not null,
	end_date date not null
)

create table Review
(
	id int primary key identity(1,1),
	reservation_id int not null,
	guest_id uniqueidentifier not null,
	rate int not null
		constraint ck_review_rate check(rate between 1 and 5),
	commentary nvarchar(max),
	created_at datetime2 default getutcdate()

	constraint fk_review_reservation foreign key (reservation_id) references Reservations(id),
	constraint fk_review_user foreign key (guest_id) references Users(id)
)

create table [Notification]
(
	id int primary key identity(1,1),
	[user_id] uniqueidentifier not null,
	title nvarchar(50) not null,
	[message] nvarchar(max) not null,
	is_read bit default 0,
	created_at datetime2 default getutcdate()

	constraint fk_notification_user foreign key ([user_id]) references Users(id)
)