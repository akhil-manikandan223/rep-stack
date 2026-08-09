import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideAlertTriangle,
  lucideBarChart3,
  lucideCalendarPlus,
  lucideDumbbell,
  lucideLogIn,
  lucideUserCheck,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

interface ActivityLogEntry {
  action: string;
  timestamp: string;
}

interface CalendarCell {
  day: number | null;
  isToday: boolean;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function buildCalendarWeeks(today: Date): CalendarCell[][] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: CalendarCell[] = [
    ...Array.from({ length: firstWeekday }, () => ({ day: null, isToday: false })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isToday: i + 1 === today.getDate(),
    })),
  ];

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, isToday: false });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

@Component({
  selector: 'app-dashboard',
  imports: [NgIcon, HlmButtonImports],
  providers: [
    provideIcons({
      lucideUsers,
      lucideUserCheck,
      lucideDumbbell,
      lucideActivity,
      lucideLogIn,
      lucideAlertTriangle,
      lucideBarChart3,
      lucideUserPlus,
      lucideCalendarPlus,
    }),
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly recentActivity: ActivityLogEntry[] = [
    { action: 'Checked in Priya Sharma for a PT session', timestamp: '10 min ago' },
    { action: 'Added new equipment: Treadmill #4', timestamp: '1 hour ago' },
    { action: 'Renewed membership for Arjun Mehta', timestamp: '3 hours ago' },
    { action: 'Marked "Rowing Machine #2" for maintenance', timestamp: 'Yesterday' },
    { action: 'Registered new member: Fatima Khan', timestamp: 'Yesterday' },
  ];

  protected readonly monthLabel: string;
  protected readonly calendarWeeks: CalendarCell[][];

  constructor() {
    const today = new Date();
    this.monthLabel = `${MONTH_LABELS[today.getMonth()]} ${today.getFullYear()}`;
    this.calendarWeeks = buildCalendarWeeks(today);
  }
}
