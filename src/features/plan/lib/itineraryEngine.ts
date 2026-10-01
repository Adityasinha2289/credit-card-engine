import { TripPlanDraft, ItineraryDay, TransportOption, StayOption, ActivityOption, ItineraryEvent } from '../types';

export function buildItinerary(
  draft: TripPlanDraft,
  transport: TransportOption,
  stay: StayOption,
  activities: ActivityOption[]
): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  
  // Calculate total days
  let totalDays = 3; // default for demo if dates are missing
  if (draft.departureDate && draft.returnDate) {
    const start = new Date(draft.departureDate);
    const end = new Date(draft.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } else if (draft.departureDate) {
    totalDays = 1;
  }

  const parseTime = (t: string) => {
    if (t === 'ESTIMATED') return 23.5 * 60; // end of day
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const sortEvents = (events: ItineraryEvent[]) => {
    return events.sort((a, b) => parseTime(a.time) - parseTime(b.time));
  };

  // Day 1: Arrival & Check-in
  const day1Events: ItineraryEvent[] = [];
  
  day1Events.push({
    time: transport.departureTime || '08:00',
    title: `Depart from ${draft.origin?.name || 'Origin'}`,
    description: transport.service,
    type: 'TRANSPORT',
    costEstimate: transport.price
  });

  const arrivalTime = transport.arrivalTime || '10:00';
  day1Events.push({
    time: arrivalTime,
    title: `Arrive at ${draft.destination?.name || 'Destination'}`,
    type: 'TRANSPORT'
  });

  const arrivalMins = parseTime(arrivalTime);
  const checkInMins = Math.max(arrivalMins + 60, parseTime('14:00'));

  if (stay.hotelName && totalDays > 1) {
    day1Events.push({
      time: formatTime(checkInMins),
      title: `Check-in at ${stay.hotelName}`,
      description: stay.locationContext,
      type: 'STAY',
      costEstimate: stay.totalStayPrice
    });
  }

  // Allocate activities across days
  let activityIndex = 0;
  
  let currentDayMins = stay.hotelName && totalDays > 1 ? checkInMins + 60 : arrivalMins + 60;
  currentDayMins = Math.max(currentDayMins, parseTime('16:00'));

  if (currentDayMins <= parseTime('20:00') && activities[activityIndex]) {
    day1Events.push({
      time: formatTime(currentDayMins),
      title: activities[activityIndex].name,
      description: activities[activityIndex].category,
      type: 'ACTIVITY',
      costEstimate: activities[activityIndex].entryCost
    });
    currentDayMins += (activities[activityIndex].durationMinutes || 120);
    activityIndex++;
  }

  const dinnerMins = Math.max(currentDayMins + 60, parseTime('19:30'));
  day1Events.push({
    time: formatTime(dinnerMins),
    title: 'Dinner',
    type: 'FOOD'
  });

  days.push({
    dayNumber: 1,
    date: draft.departureDate || 'Day 1',
    events: sortEvents(day1Events)
  });

  // Middle days
  for (let i = 2; i < totalDays; i++) {
    const dayEvents: ItineraryEvent[] = [];
    
    dayEvents.push({ time: '09:00', title: 'Breakfast', type: 'FOOD' });
    
    if (activities[activityIndex]) {
      dayEvents.push({
        time: '10:30',
        title: activities[activityIndex].name,
        type: 'ACTIVITY',
        costEstimate: activities[activityIndex].entryCost
      });
      activityIndex++;
    }

    dayEvents.push({ time: '13:30', title: 'Lunch', type: 'FOOD' });
    
    if (activities[activityIndex]) {
      dayEvents.push({
        time: '15:30',
        title: activities[activityIndex].name,
        type: 'ACTIVITY',
        costEstimate: activities[activityIndex].entryCost
      });
      activityIndex++;
    }

    dayEvents.push({ time: '20:00', title: 'Dinner', type: 'FOOD' });
    
    days.push({
      dayNumber: i,
      date: `Day ${i}`,
      events: sortEvents(dayEvents)
    });
  }

  // Final day
  if (totalDays > 1) {
    const finalDayEvents: ItineraryEvent[] = [];
    finalDayEvents.push({ time: '09:00', title: 'Breakfast', type: 'FOOD' });
    
    if (stay.hotelName) {
      finalDayEvents.push({ time: '11:00', title: 'Check-out', type: 'STAY' });
    }

    if (draft.tripType === 'round-trip') {
      finalDayEvents.push({
        time: 'ESTIMATED',
        title: `Depart for ${draft.origin?.name || 'Home'}`,
        type: 'TRANSPORT'
      });
    }

    days.push({
      dayNumber: totalDays,
      date: draft.returnDate || `Day ${totalDays}`,
      events: sortEvents(finalDayEvents)
    });
  } else {
    // If it's a 1-day trip, we append the return journey to day 1
    if (draft.tripType === 'round-trip') {
      days[0].events.push({
        time: 'ESTIMATED',
        title: `Depart for ${draft.origin?.name || 'Home'}`,
        type: 'TRANSPORT'
      });
      days[0].events = sortEvents(days[0].events);
    }
  }

  return days;
}
