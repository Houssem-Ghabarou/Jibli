import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function formatDateDisplay(dateFrom: string | null, dateTo: string | null): string {
  if (!dateFrom) return 'Any date';
  if (!dateTo || dateFrom === dateTo) {
    const [, m, d] = dateFrom.split('-');
    return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${parseInt(d)}`;
  }
  const [, mf, df] = dateFrom.split('-');
  const [, mt, dt] = dateTo.split('-');
  if (mf === mt) return `${MONTHS[parseInt(mf)-1].slice(0,3)} ${parseInt(df)}–${parseInt(dt)}`;
  return `${MONTHS[parseInt(mf)-1].slice(0,3)} ${parseInt(df)} – ${MONTHS[parseInt(mt)-1].slice(0,3)} ${parseInt(dt)}`;
}

interface Props {
  visible: boolean;
  /** 'single' — one date only; 'range' — start + end date */
  mode?: 'single' | 'range';
  initialFrom?: string | null;
  initialTo?: string | null;
  onConfirm: (from: string, to: string) => void;
  onClear?: () => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible,
  mode = 'range',
  initialFrom,
  initialTo,
  onConfirm,
  onClear,
  onClose,
}: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [start, setStart] = useState<string | null>(initialFrom ?? null);
  const [end, setEnd] = useState<string | null>(initialTo ?? null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayStr = toYMD(today);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function prevMonth() {
    if (isCurrentMonth) return;
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function handleDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (mode === 'single') {
      setStart(dateStr);
      setEnd(dateStr);
      return;
    }

    // range mode
    if (!start || (start && end)) {
      setStart(dateStr);
      setEnd(null);
    } else {
      if (dateStr < start) {
        setStart(dateStr);
        setEnd(null);
      } else {
        setEnd(dateStr);
      }
    }
  }

  function cellStr(day: number) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }

  function isDaySelected(day: number) {
    const s = cellStr(day);
    return s === start || s === end;
  }

  function isDayInRange(day: number) {
    if (!start || !end) return false;
    const s = cellStr(day);
    return s > start && s < end;
  }

  function isDayPast(day: number) {
    return cellStr(day) < todayStr;
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canConfirm = mode === 'single' ? !!start : !!start;

  let hint = '';
  if (mode === 'single') {
    hint = start ? `Selected: ${start}` : 'Tap a date';
  } else {
    if (!start) hint = 'Tap to select start date';
    else if (!end) hint = 'Tap to select end date';
    else hint = `${start}  →  ${end}`;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          {/* Month nav */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} disabled={isCurrentMonth}>
              <Ionicons name="chevron-back" size={20} color={isCurrentMonth ? Colors.textMuted : Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Today shortcut */}
          <TouchableOpacity
            style={styles.todayBtn}
            onPress={() => {
              setStart(todayStr);
              setEnd(todayStr);
              setYear(today.getFullYear());
              setMonth(today.getMonth());
            }}
          >
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>

          {/* Day headers */}
          <View style={styles.weekRow}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={styles.cell} />;
              const selected = isDaySelected(day);
              const inRange = isDayInRange(day);
              const past = isDayPast(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.cell, inRange && styles.cellRange, selected && styles.cellSelected]}
                  onPress={() => !past && handleDay(day)}
                  activeOpacity={past ? 1 : 0.7}
                >
                  <Text style={[
                    styles.dayText,
                    selected && styles.dayTextSelected,
                    past && styles.dayTextPast,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.hint}>{hint}</Text>

          <View style={styles.actions}>
            {onClear && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setStart(null); setEnd(null); onClear(); }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, !canConfirm && styles.confirmDisabled, !onClear && { flex: 1 }]}
              disabled={!canConfirm}
              onPress={() => {
                if (start) onConfirm(start, end ?? start);
              }}
            >
              <Text style={styles.confirmText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  todayBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: 10,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    paddingBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
  },
  cellRange: {
    backgroundColor: Colors.accent + '22',
  },
  dayText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  dayTextPast: {
    color: Colors.textMuted,
    opacity: 0.4,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
