import moment from 'moment';
import 'moment-business-days';

export class BusinessDayService {
  private federalHolidays: string[] = [];

  constructor() {
    this.initializeFederalHolidays();
  }

  private initializeFederalHolidays() {
    const currentYear = new Date().getFullYear();
    
    // Define federal holidays for the current year
    this.federalHolidays = [
      `${currentYear}-01-01`, // New Year's Day
      this.getMLKDay(currentYear), // Martin Luther King Jr. Day
      this.getPresidentsDay(currentYear), // Presidents' Day
      this.getMemorialDay(currentYear), // Memorial Day
      `${currentYear}-07-04`, // Independence Day
      this.getLaborDay(currentYear), // Labor Day
      this.getColumbusDay(currentYear), // Columbus Day
      `${currentYear}-11-11`, // Veterans Day
      this.getThanksgiving(currentYear), // Thanksgiving
      `${currentYear}-12-25`, // Christmas Day
    ];
  }

  private getMLKDay(year: number): string {
    // Third Monday in January
    const jan = moment([year, 0, 1]);
    const firstMonday = jan.clone().day(1);
    if (firstMonday.date() > 1) firstMonday.add(1, 'week');
    return firstMonday.add(2, 'weeks').format('YYYY-MM-DD');
  }

  private getPresidentsDay(year: number): string {
    // Third Monday in February
    const feb = moment([year, 1, 1]);
    const firstMonday = feb.clone().day(1);
    if (firstMonday.date() > 1) firstMonday.add(1, 'week');
    return firstMonday.add(2, 'weeks').format('YYYY-MM-DD');
  }

  private getMemorialDay(year: number): string {
    // Last Monday in May
    const may = moment([year, 4, 31]);
    return may.clone().day(1).format('YYYY-MM-DD');
  }

  private getLaborDay(year: number): string {
    // First Monday in September
    const sep = moment([year, 8, 1]);
    const firstMonday = sep.clone().day(1);
    if (firstMonday.date() > 1) firstMonday.add(1, 'week');
    return firstMonday.format('YYYY-MM-DD');
  }

  private getColumbusDay(year: number): string {
    // Second Monday in October
    const oct = moment([year, 9, 1]);
    const firstMonday = oct.clone().day(1);
    if (firstMonday.date() > 1) firstMonday.add(1, 'week');
    return firstMonday.add(1, 'week').format('YYYY-MM-DD');
  }

  private getThanksgiving(year: number): string {
    // Fourth Thursday in November
    const nov = moment([year, 10, 1]);
    const firstThursday = nov.clone().day(4);
    if (firstThursday.date() > 1) firstThursday.add(1, 'week');
    return firstThursday.add(3, 'weeks').format('YYYY-MM-DD');
  }

  isBusinessDay(date: string | Date): boolean {
    const momentDate = moment(date);
    
    // Check if it's a weekend
    if (momentDate.day() === 0 || momentDate.day() === 6) {
      return false;
    }
    
    // Check if it's a federal holiday
    const dateString = momentDate.format('YYYY-MM-DD');
    return !this.federalHolidays.includes(dateString);
  }

  getNextBusinessDay(date: string | Date): string {
    let nextDay = moment(date).add(1, 'day');
    
    while (!this.isBusinessDay(nextDay.toDate())) {
      nextDay = nextDay.add(1, 'day');
    }
    
    return nextDay.format('YYYY-MM-DD');
  }

  getPreviousBusinessDay(date: string | Date): string {
    let prevDay = moment(date).subtract(1, 'day');
    
    while (!this.isBusinessDay(prevDay.toDate())) {
      prevDay = prevDay.subtract(1, 'day');
    }
    
    return prevDay.format('YYYY-MM-DD');
  }

  addBusinessDays(date: string | Date, days: number): string {
    let result = moment(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result = result.add(1, 'day');
      if (this.isBusinessDay(result.toDate())) {
        addedDays++;
      }
    }
    
    return result.format('YYYY-MM-DD');
  }

  getFederalHolidays(): string[] {
    return [...this.federalHolidays];
  }
}