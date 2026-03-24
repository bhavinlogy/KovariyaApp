import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

interface ProgressCircleProps {
  size?: number;
  progress: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  percentageStyle?: TextStyle;
}

export const ProgressCircle = React.memo(function ProgressCircle({
  size = 80,
  progress = 0,
  strokeWidth = 8,
  color = colors.primary,
  backgroundColor = colors.border,
  showPercentage = true,
  percentageStyle,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeStyle = useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size]
  );

  return (
    <View style={[styles.container, sizeStyle]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, percentageStyle]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
