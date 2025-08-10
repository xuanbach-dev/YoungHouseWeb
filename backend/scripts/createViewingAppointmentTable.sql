-- Create ViewingAppointment table for room viewing appointments
CREATE TABLE ViewingAppointment (
    AppointmentID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(15) NOT NULL,
    ViewingDate DATE NOT NULL,
    ViewingTime TIME NOT NULL,
    RoomID INT NOT NULL,
    Note NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (RoomID) REFERENCES Room(RoomID) ON DELETE CASCADE,
    
    -- Create unique constraint to prevent double booking of same time slot
    CONSTRAINT UQ_ViewingAppointment_RoomDateTime UNIQUE (RoomID, ViewingDate, ViewingTime)
);

-- Create indexes for better performance
CREATE INDEX IX_ViewingAppointment_ViewingDate ON ViewingAppointment(ViewingDate);
CREATE INDEX IX_ViewingAppointment_Status ON ViewingAppointment(Status);
CREATE INDEX IX_ViewingAppointment_RoomID ON ViewingAppointment(RoomID);
CREATE INDEX IX_ViewingAppointment_Email ON ViewingAppointment(Email);

-- Insert some sample data for testing
INSERT INTO ViewingAppointment (FullName, Email, Phone, ViewingDate, ViewingTime, RoomID, Note, Status) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', '0901234567', '2024-01-20', '10:00:00', 1, 'Tôi muốn xem phòng vào buổi sáng', 'Pending'),
('Trần Thị B', 'tranthib@email.com', '0987654321', '2024-01-20', '14:00:00', 1, 'Có thể xem phòng vào buổi chiều', 'Confirmed'),
('Lê Minh C', 'leminhc@email.com', '0912345678', '2024-01-21', '09:00:00', 2, '', 'Pending'),
('Phạm Thị D', 'phamthid@email.com', '0934567890', '2024-01-22', '15:00:00', 3, 'Muốn xem phòng có ban công', 'Completed');

-- Add comments to the table
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Bảng lưu trữ thông tin lịch hẹn xem phòng của khách hàng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'ID duy nhất của lịch hẹn', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'AppointmentID';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Họ và tên của khách hàng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'FullName';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Địa chỉ email của khách hàng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'Email';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Số điện thoại của khách hàng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'Phone';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Ngày hẹn xem phòng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'ViewingDate';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Giờ hẹn xem phòng', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'ViewingTime';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Ghi chú của khách hàng về lịch hẹn', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'Note';

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Trạng thái của lịch hẹn: Pending, Confirmed, Completed, Cancelled', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ViewingAppointment', 
    @level2type=N'COLUMN', @level2name=N'Status';