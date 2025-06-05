import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";

interface CalendarModalProps {
  onClose: (selectedDate: Date | null) => void;
  open: boolean; // Add 'open' prop to control modal visibility
}

const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, open }) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleClose = () => {
    onClose(selectedDate?.toDate() || null);
  };

  if (!open) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h6">Выберите дату</Typography>
        <DatePicker
          label="Дата"
          value={selectedDate}
          onChange={handleDateChange}
          slots={{
            textField: TextField,
          }}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />
        {selectedDate !== null && (
          <Button onClick={handleClose}>Выбрать</Button>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarModal;