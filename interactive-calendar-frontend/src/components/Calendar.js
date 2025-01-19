import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './Calendar.css';
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [allReservations, setAllReservations] = useState([]);
    const [newEvent, setNewEvent] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        startDateTime: '',
        endDateTime: '',
        description: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [showReservations, setShowReservations] = useState(false);
    const navigate = useNavigate();

    // Helper function to get token
    const getToken = () => localStorage.getItem('token');

    // Redirect to login if token is missing
    useEffect(() => {
        const token = getToken();
        if (!token) {
            alert('You must log in to access the calendar.');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const token = getToken();
        axios
            .get('http://localhost:5000/api/reservations', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const formattedEvents = response.data.map(reservation => ({
                    title: `${reservation.firstName} ${reservation.lastName}`,
                    start: reservation.startDateTime,
                    end: reservation.endDateTime,
                    description: reservation.description,
                    id: reservation._id
                }));
                setEvents(formattedEvents);
                setAllReservations(response.data);  // Save all reservations for sorting and viewing
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    console.error('Error fetching reservations:', error);
                }
            });
    }, [navigate]);

    // Sort reservations by start date
    const sortReservationsByDate = () => {
        const sorted = [...allReservations].sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
        setAllReservations(sorted);
    };

    const handleEventEdit = (eventId, updatedEvent) => {
        const token = getToken();
        axios
            .put(`http://localhost:5000/api/reservations/${eventId}`, updatedEvent, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                setEvents(events.map(event =>
                    event.id === eventId
                        ? { ...event, ...updatedEvent, title: `${updatedEvent.firstName} ${updatedEvent.lastName}` }
                        : event
                ));
                setIsEditing(false);
                setEditingEventId(null);
            })
            .catch(error => console.error('Error updating reservation:', error));
    };

    const handleEventDelete = (eventId) => {
        const token = getToken();
        axios
            .delete(`http://localhost:5000/api/reservations/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => {
                setEvents(events.filter(event => event.id !== eventId));
                setIsEditing(false);
                setEditingEventId(null);
            })
            .catch(error => console.error('Error deleting reservation:', error));
    };

    const handleEventClick = (info) => {
        const clickedEvent = events.find(event => event.id === info.event.id);
        setNewEvent({
            firstName: clickedEvent.title.split(' ')[0],
            lastName: clickedEvent.title.split(' ')[1],
            email: '',
            phoneNumber: '',
            startDateTime: clickedEvent.start,
            endDateTime: clickedEvent.end,
            description: clickedEvent.description || ''
        });
        setEditingEventId(clickedEvent.id);
        setIsEditing(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = getToken();
        if (isEditing) {
            handleEventEdit(editingEventId, newEvent);
        } else {
            axios
                .post('http://localhost:5000/api/reservations', newEvent, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    setEvents([
                        ...events,
                        {
                            title: `${response.data.firstName} ${response.data.lastName}`,
                            start: response.data.startDateTime,
                            end: response.data.endDateTime,
                            description: response.data.description,
                            id: response.data._id
                        }
                    ]);
                    setNewEvent({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phoneNumber: '',
                        startDateTime: '',
                        endDateTime: '',
                        description: ''
                    });
                })
                .catch(error => console.error('Error adding reservation:', error));
        }
    };

    return (
        <div className="calendar-container">
            <h1>Interactive Calendar</h1>

            <div className="calendar">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    dateClick={(arg) => setNewEvent({ ...newEvent, startDateTime: arg.dateStr })}
                    eventClick={handleEventClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                />
            </div>

            <div className="booking-form">
                <h2>{isEditing ? "Edit Reservation" : "Book a Reservation"}</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        First Name:
                        <input
                            type="text"
                            value={newEvent.firstName}
                            onChange={(e) => setNewEvent({ ...newEvent, firstName: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            value={newEvent.lastName}
                            onChange={(e) => setNewEvent({ ...newEvent, lastName: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={newEvent.email}
                            onChange={(e) => setNewEvent({ ...newEvent, email: e.target.value })}
                        />
                    </label>
                    <label>
                        Phone Number:
                        <input
                            type="text"
                            value={newEvent.phoneNumber}
                            onChange={(e) => setNewEvent({ ...newEvent, phoneNumber: e.target.value })}
                        />
                    </label>
                    <label>
                        Start Date & Time:
                        <input
                            type="datetime-local"
                            value={newEvent.startDateTime}
                            onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        End Date & Time:
                        <input
                            type="datetime-local"
                            value={newEvent.endDateTime}
                            onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                    </label>
                    <button type="submit">{isEditing ? "Update Reservation" : "Submit Reservation"}</button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => handleEventDelete(editingEventId)}
                            style={{ backgroundColor: 'red', color: 'white' }}
                        >
                            Delete Reservation
                        </button>
                    )}
                </form>
            </div>
        
            <br />
            <br />
            <br />
            {/* Button to show all reservations */}
            <button onClick={() => setShowReservations(!showReservations)}>
                {showReservations ? 'Hide Reservations' : 'All Reservations'}
            </button>

            {/* Reservations list in a table */}
            {showReservations && (
                <div className="reservations-list">
                    <h3>All Reservations</h3>
                    <button onClick={sortReservationsByDate}>Sort by Date</button>
                    <table className="reservations-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allReservations.map((reservation) => (
                                <tr key={reservation._id}>
                                    <td>{`${reservation.firstName} ${reservation.lastName}`}</td>
                                    <td>{new Date(reservation.startDateTime).toLocaleString()}</td>
                                    <td>{new Date(reservation.endDateTime).toLocaleString()}</td>
                                    <td>{reservation.description || 'No description'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Calendar;
