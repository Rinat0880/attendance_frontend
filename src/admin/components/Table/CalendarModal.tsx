import React, { useState } from "react";
import { Box, Button, Typography, Modal } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface CalendarModalProps {
  onClose: (selectedDate: Date | null) => void;
  open: boolean;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, open }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleClose = () => {
    onClose(selectedDate?.toDate() || null);
  };

  return (
    <Modal
      open={open}
      onClose={() => onClose(null)}
      aria-labelledby="calendar-modal-title"
      aria-describedby="calendar-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Typography id="calendar-modal-title" variant="h6" component="h2">
           月と年を選択
          </Typography>
          <DatePicker
            
            value={selectedDate}
            onChange={handleDateChange}
            sx={{ mt: 2, width: '100%' }}
          />
          <Button onClick={handleClose} variant="contained" sx={{ mt: 2 }}>
          選択
          </Button>
        </LocalizationProvider>
      </Box>
    </Modal>
  );
};

export default CalendarModal;
