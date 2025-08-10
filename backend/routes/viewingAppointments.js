const express = require('express');
const router = express.Router();
const ViewingAppointment = require('../models/ViewingAppointment');

// Get all viewing appointments with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    
    const appointments = await ViewingAppointment.getAll(page, limit, status);
    
    res.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        filters: { status }
      },
      message: 'Danh sách lịch hẹn xem phòng được tải thành công'
    });
  } catch (error) {
    console.error('Error fetching viewing appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Get viewing appointment statistics
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await ViewingAppointment.getStatistics();
    
    res.json({
      success: true,
      data: statistics,
      message: 'Thống kê lịch hẹn xem phòng được tải thành công'
    });
  } catch (error) {
    console.error('Error fetching viewing appointment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thống kê lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Check time slot availability
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, viewingDate, viewingTime } = req.body;
    
    if (!roomId || !viewingDate || !viewingTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: mã phòng, ngày xem và giờ xem'
      });
    }
    
    const isAvailable = await ViewingAppointment.checkTimeSlotAvailability(roomId, viewingDate, viewingTime);
    
    res.json({
      success: true,
      data: {
        roomId,
        viewingDate,
        viewingTime,
        isAvailable
      },
      message: `Khung giờ ${isAvailable ? 'còn trống' : 'đã được đặt'}`
    });
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra tình trạng khung giờ',
      error: error.message
    });
  }
});

// Get available time slots for a specific date and room
router.get('/available-slots/:roomId/:date', async (req, res) => {
  try {
    const { roomId, date } = req.params;
    
    const availableSlots = await ViewingAppointment.getAvailableTimeSlots(roomId, date);
    
    res.json({
      success: true,
      data: {
        roomId,
        date,
        availableSlots
      },
      message: 'Danh sách khung giờ trống được tải thành công'
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách khung giờ trống',
      error: error.message
    });
  }
});

// Get viewing appointments by room
router.get('/room/:roomId', async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const appointments = await ViewingAppointment.getByRoom(roomId, startDate, endDate);

    res.json({
      success: true,
      data: appointments,
      filters: { startDate, endDate },
      message: 'Danh sách lịch hẹn xem phòng theo phòng được tải thành công'
    });
  } catch (error) {
    console.error('Error fetching room viewing appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách lịch hẹn xem phòng theo phòng',
      error: error.message
    });
  }
});

// Create new viewing appointment
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, viewingDate, viewingTime, roomId, note } = req.body;
    
    // Validation
    if (!fullName || !email || !phone || !viewingDate || !viewingTime || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc: Họ tên, Email, Số điện thoại, Ngày xem phòng, Giờ xem phòng và Mã phòng'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ'
      });
    }

    // Validate phone format (Vietnamese phone number)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)'
      });
    }
    
    // Validate viewing date (must be in the future)
    const viewingDateTime = new Date(`${viewingDate} ${viewingTime}`);
    const now = new Date();
    
    if (viewingDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Ngày và giờ xem phòng phải sau thời điểm hiện tại'
      });
    }

    // Validate viewing time (business hours: 9:00 - 18:00)
    const validTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    if (!validTimes.includes(viewingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Giờ xem phòng phải trong khung giờ làm việc (9:00 - 18:00)'
      });
    }
    
    const newAppointment = await ViewingAppointment.create({
      fullName,
      email,
      phone,
      viewingDate,
      viewingTime,
      roomId,
      note: note || '',
      status: 'Pending'
    });
    
    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Lịch hẹn xem phòng được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận.'
    });
  } catch (error) {
    console.error('Error creating viewing appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Đã có lịch hẹn') ? error.message : 'Không thể tạo lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Update viewing appointment
router.put('/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { fullName, email, phone, viewingDate, viewingTime, roomId, note, status } = req.body;
    
    // Validation
    if (!fullName || !email || !phone || !viewingDate || !viewingTime || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ'
      });
    }

    // Validate phone format
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }
    
    const updatedAppointment = await ViewingAppointment.update(appointmentId, {
      fullName,
      email,
      phone,
      viewingDate,
      viewingTime,
      roomId,
      note,
      status
    });
    
    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn xem phòng'
      });
    }
    
    res.json({
      success: true,
      data: updatedAppointment,
      message: 'Lịch hẹn xem phòng được cập nhật thành công'
    });
  } catch (error) {
    console.error('Error updating viewing appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Đã có lịch hẹn') ? error.message : 'Không thể cập nhật lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Update viewing appointment status only
router.patch('/:id/status', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái là bắt buộc'
      });
    }
    
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Các trạng thái hợp lệ: ' + validStatuses.join(', ')
      });
    }
    
    const updatedAppointment = await ViewingAppointment.updateStatus(appointmentId, status);
    
    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn xem phòng'
      });
    }
    
    res.json({
      success: true,
      data: updatedAppointment,
      message: 'Trạng thái lịch hẹn xem phòng được cập nhật thành công'
    });
  } catch (error) {
    console.error('Error updating viewing appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Get viewing appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const appointment = await ViewingAppointment.getById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn xem phòng'
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Thông tin lịch hẹn xem phòng được tải thành công'
    });
  } catch (error) {
    console.error('Error fetching viewing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thông tin lịch hẹn xem phòng',
      error: error.message
    });
  }
});

// Delete viewing appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const deleted = await ViewingAppointment.delete(appointmentId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn xem phòng'
      });
    }
    
    res.json({
      success: true,
      message: 'Lịch hẹn xem phòng được xóa thành công'
    });
  } catch (error) {
    console.error('Error deleting viewing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa lịch hẹn xem phòng',
      error: error.message
    });
  }
});

module.exports = router;