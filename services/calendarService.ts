
import { SocialPost } from '../types';

/**
 * Generates an ICS file string for a list of social media posts.
 * This format is compatible with Google Calendar, Outlook, and Apple Calendar.
 */
export const generateICS = (posts: SocialPost[], brandName: string = "Socials by MCCIA"): string => {
  const formatDate = (dateStr: string, timeStr: string) => {
    // Input: YYYY-MM-DD and HH:mm
    // Output: YYYYMMDDTHHmmSSZ
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/:/g, '');
    return `${cleanDate}T${cleanTime}00`;
  };

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Socials by MCCIA//Social Media Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  posts.forEach(post => {
    const start = formatDate(post.scheduledDate, post.scheduledTime);
    // Assume 30 min duration for the "event"
    const endHour = parseInt(post.scheduledTime.split(':')[0]);
    const endMin = (parseInt(post.scheduledTime.split(':')[1]) + 30) % 60;
    const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    const end = formatDate(post.scheduledDate, endStr);

    const description = `
Platform(s): ${post.platforms.join(', ')}
Status: ${post.status.toUpperCase()}

CAPTION:
${post.caption}

IMAGE PROMPT:
${post.imagePrompt || 'No prompt provided'}

TAGS:
${post.tags?.join(', ') || 'None'}
    `.trim().replace(/\n/g, '\\n');

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${post.id}@socials-mccia.ai`);
    icsLines.push(`DTSTAMP:${start}Z`);
    icsLines.push(`DTSTART:${start}`);
    icsLines.push(`DTEND:${end}`);
    icsLines.push(`SUMMARY:[${brandName}] ${post.title || 'Social Media Post'}`);
    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  return icsLines.join('\r\n');
};

export const downloadICS = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
