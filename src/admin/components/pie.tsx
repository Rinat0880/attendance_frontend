import React, { useEffect, useState } from 'react'; 
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../utils/libs/axios.ts';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PieData {
  absent: number;
  come: number;
}

interface PieCenterLabelProps {
  children: React.ReactNode;
}

const size = {
  width: 350,
  height: 300,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 35,
}));

function PieCenterLabel({ children }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

// Компоненты с фиксированным положением
const LegendContainer = styled('div')({
  position: 'absolute',
  left: 280,
  top: 130,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

const LegendItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  whiteSpace: 'nowrap',
});

const ColorIndicator = styled('div')<{ bgcolor: string }>(({ bgcolor }) => ({
  width: '16px',
  height: '16px',
  backgroundColor: bgcolor,
  borderRadius: '2px',
  flexShrink: 0,
}));

const LegendText = styled(Typography)({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.2,
});

export default function PieChartWithCenterLabel() {
  const [data, setData] = useState<{ value: number; label: string; color: string }[]>([]);
  const { t } = useTranslation('admin');

  const getPieData = React.useCallback(async () => {
    try {
      const response = await axiosInstance().get('/attendance/piechart');
  
      const pieValue: PieData = response.data.data;
      const colors = response.data.Colors; // Get colors from the response
  
      setData([
        { value: pieValue.come, label: t('pieChart.come'), color: colors.present_color },
        { value: pieValue.absent, label: t('pieChart.absent'), color: colors.absent_color },
      ]);
    } catch (err) {
      console.log('Error fetching pie chart data:', err);
    }
  }, [t]);
  
  useEffect(() => {
    getPieData();
  }, [getPieData]);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: size.width, 
      height: size.height,
      overflow: 'visible'
    }}>
      {/* Chart with fixed dimensions */}
      <PieChart
        series={[{ 
          data, 
          innerRadius: 90,
          highlightScope: { faded: 'global' },
          faded: { innerRadius: 95 },
          paddingAngle: 0,
          cornerRadius: 0,
        }]} 
        width={size.width}
        height={size.height}
        margin={{ right: 120 }} 
        legend={{ hidden: true }}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        {data.length > 0 && (
          <PieCenterLabel>{data[0].value}%</PieCenterLabel>
        )}
      </PieChart>

      {/* Fixed position legend */}
      {data.length > 0 && (
        <LegendContainer>
          {data.map((item, index) => (
            <LegendItem key={index}>
              <ColorIndicator bgcolor={item.color} />
              <LegendText>{item.label}</LegendText>
            </LegendItem>
          ))}
        </LegendContainer>
      )}
    </Box>
  );
}