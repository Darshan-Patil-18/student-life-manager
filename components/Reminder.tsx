'use client'

export default function Reminder() {
  function openGoogleCalendar() {
    window.open('https://calendar.google.com/calendar/r/eventedit', '_blank')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set a Reminder</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Open Google Calendar to create an event with a date, time, and
          reminder notification — so you never miss a deadline.
        </p>

        <button
          onClick={openGoogleCalendar}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 active:scale-95 cursor-pointer text-base flex items-center justify-center gap-2.5"
        >
          {/* Google Calendar icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 3h-2V1.5a.5.5 0 0 0-1 0V3h-9V1.5a.5.5 0 0 0-1 0V3h-2A2.5 2.5 0 0 0 2 5.5v14A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-14A2.5 2.5 0 0 0 19.5 3zM3 8h18v11.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5V8z"/>
          </svg>
          Set Reminder on Google Calendar
        </button>
      </div>

      {/* Tip */}
      <div className="max-w-sm w-full bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
        <p className="text-blue-700 text-sm font-medium mb-1">💡 How it works</p>
        <p className="text-blue-600 text-sm">
          Google Calendar will open in a new tab. Set your event title, pick a
          date &amp; time, and add a notification so you get reminded on time.
        </p>
      </div>
    </div>
  )
}
