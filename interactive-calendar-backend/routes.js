const express = require('express');
const router = express.Router();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const Reservation = require('./models/Reservation');
const bcrypt = require('bcrypt');

// klucz JWT
const SECRET = 'your_secret_key';

// weryfikacja tokenu JWT
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// rejestracja użytkownika
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // sprawdzenie, czy użytkownik już istnieje
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // tworzenie nowego użytkownika
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// logowanie użytkownika
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

router.use(authenticate);

// pobieranie wszystkich rezerwacji
router.get('/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// tworzenie rezerwacji
router.post('/reservations', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, startDateTime, endDateTime, description } = req.body;

        // sprawdzenie dostępności terminu przed dodaniem rezerwacji
        const existingReservations = await Reservation.find({
            $or: [
                {
                    startDateTime: { $lt: endDateTime },
                    endDateTime: { $gt: startDateTime }
                }
            ]
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ message: 'The selected time slot is already booked.' });
        }

        // tworzenie nowej rezerwacji
        const newReservation = new Reservation({
            firstName,
            lastName,
            email,
            phoneNumber,
            startDateTime,
            endDateTime,
            description,
        });

        await newReservation.save();
        res.status(201).json(newReservation);
    } catch (err) {
        res.status(400).json({ message: 'Error creating reservation' });
    }
});

// usuwanie rezerwacji
router.delete('/reservations/:id', async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json({ message: 'Reservation deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// sprawdzanie dostępności terminu
router.post('/check-availability', async (req, res) => {
    const { startDateTime, endDateTime } = req.body;

    try {
        // szukamy rezerwacji, które zachodzą w tym samym czasie
        const existingReservations = await Reservation.find({
            $or: [
                {
                    startDateTime: { $lt: endDateTime },

                    endDateTime: { $gt: startDateTime }
                }
            ]
        });

        // jeśli istnieją rezerwacje, termin jest zajęty
        if (existingReservations.length > 0) {
            return res.status(400).json({ message: 'The selected time slot is already booked.' });
        }

        // termin jest dostępny
        res.status(200).json({ message: 'The selected time slot is available.' });
    } catch (error) {
        console.error('Error checking availability:', error);  // Dodajemy logi błędu
        res.status(500).json({ message: 'Error checking availability.' });
    }
});


// aktualizacja rezerwacji
router.put('/reservations/:id', async (req, res) => {
    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
