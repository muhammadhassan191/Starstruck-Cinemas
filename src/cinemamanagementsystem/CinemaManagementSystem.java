package CinemaManagementSystem;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import static javax.swing.WindowConstants.EXIT_ON_CLOSE;

public class CinemaManagementSystem extends JFrame {
    private ArrayList<Movie> movies = new ArrayList<>();
    private ArrayList<Admin> admins = new ArrayList<>();
    private static final String BACKGROUND_IMAGE_PATH = "C:\\Users\\INTEL\\Downloads\\LOGO.jpeg";
    private DatabaseManager dbManager = new DatabaseManager();

    public CinemaManagementSystem() {
        loadMovies();
        loadAdmins();

        setTitle("DAK'S CINEMAS");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        ImageIcon backgroundImage = new ImageIcon(BACKGROUND_IMAGE_PATH);
        JLabel backgroundLabel = new JLabel(backgroundImage);
        backgroundLabel.setLayout(new BorderLayout());

        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setOpaque(false);

        JButton userButton = new JButton("User");
        JButton adminButton = new JButton("Admin");
        styleButton(userButton);
        styleButton(adminButton);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridLayout(1, 2, 10, 10));
        buttonPanel.setOpaque(false);
        buttonPanel.add(userButton);
        buttonPanel.add(adminButton);

        mainPanel.add(buttonPanel, BorderLayout.SOUTH);
        backgroundLabel.add(mainPanel, BorderLayout.CENTER);
        add(backgroundLabel);

        userButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                userPanel();
            }
        });

        adminButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                adminLogin();
            }
        });
    }

    private void styleButton(JButton button) {
        button.setBackground(new Color(205, 133, 63));  
        button.setForeground(new Color(255, 228, 196)); 
        button.setFont(new Font("Arial", Font.BOLD, 20));
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createLineBorder(new Color(139, 69, 19), 2)); 
        button.setBorder(BorderFactory.createEmptyBorder(10, 25, 15, 20));
    }

    private void userPanel() {
    JPanel panel = new JPanel();
    panel.setLayout(new GridLayout(8, 2, 10, 10));
    panel.setBackground(new Color(255, 228, 200)); 

    JComboBox<String> movieComboBox = new JComboBox<>();
    JTextField seatsField = new JTextField();
    JTextField nameField = new JTextField(); 
    JTextField contactField = new JTextField(); 
    JButton bookButton = new JButton("Book");
    styleButton(bookButton);

    panel.add(new JLabel("Select Movie:"));
    panel.add(movieComboBox);
    panel.add(new JLabel("Enter Seats:"));
    panel.add(seatsField);
    panel.add(new JLabel("Your Name:")); 
    panel.add(nameField);
    panel.add(new JLabel("Contact Number:")); 
    panel.add(contactField);
    panel.add(bookButton);
    

    for (Movie movie : movies) {
        movieComboBox.addItem(movie.getName());
    }

    bookButton.addActionListener(new ActionListener() {
        @Override
        public void actionPerformed(ActionEvent e) {
            String selectedMovie = (String) movieComboBox.getSelectedItem();
            int requestedSeats;
            try {
                requestedSeats = Integer.parseInt(seatsField.getText());
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(null, "Please enter a valid number of seats!");
                return;
            }
            Movie movie = movies.stream().filter(m -> m.getName().equals(selectedMovie)).findFirst().orElse(null);
            if (movie != null && requestedSeats <= movie.getAvailableSeats()) {
                int totalCost = movie.getPrice() * requestedSeats;
                movie.setAvailableSeats(movie.getAvailableSeats() - requestedSeats);
                movie.setBookedSeats(movie.getBookedSeats() + requestedSeats);
                dbManager.updateBookedSeats(selectedMovie, movie.getBookedSeats());
                String userName = nameField.getText(); 
                String contactNumber = contactField.getText(); 
                displayReceipt(movie, requestedSeats, totalCost, userName, contactNumber); 
            } else {
                JOptionPane.showMessageDialog(null, "Not enough seats available!");
            }
        }
    });

    JOptionPane.showMessageDialog(null, panel);
}

private void displayReceipt(Movie movie, int seats, int totalCost, String userName, String contactNumber) {
    JPanel receiptPanel = new JPanel(new BorderLayout());

    
    JTextArea receiptMessage = new JTextArea();
    receiptMessage.setEditable(false);
    receiptMessage.setText("Receipt:\n\n");
    receiptMessage.append("Movie: " + movie.getName() + "\n");
    receiptMessage.append("Date: " + movie.getDate() + "\n");
    receiptMessage.append("Seats: " + seats + "\n");
    receiptMessage.append("Total Cost: $" + totalCost + "\n");
    receiptMessage.append("Name: " + userName + "\n"); 
    receiptMessage.append("Contact Number: " + contactNumber + "\n"); 
    receiptMessage.append("Enjoy the movie!");

    
    JLabel posterLabel = new JLabel();
    ImageIcon posterIcon = new ImageIcon(movie.getPosterPath());
    posterLabel.setIcon(posterIcon);

    
    receiptPanel.add(receiptMessage, BorderLayout.CENTER);
    receiptPanel.add(posterLabel, BorderLayout.WEST);

    
    JOptionPane.showMessageDialog(null, receiptPanel, "Receipt", JOptionPane.PLAIN_MESSAGE);
}


    private void adminLogin() {
        JPanel panel = new JPanel(new GridLayout(2, 2, 10, 10));
        JTextField usernameField = new JTextField();
        JPasswordField passwordField = new JPasswordField();
        panel.setBackground(new Color(255, 228, 196)); 

        panel.add(new JLabel("Username:"));
        panel.add(usernameField);
        panel.add(new JLabel("Password:"));
        panel.add(passwordField);

        int option = JOptionPane.showConfirmDialog(null, panel, "Admin Login", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);

        if (option == JOptionPane.OK_OPTION) {
            String username = usernameField.getText();
            String enteredPassword = new String(passwordField.getPassword());

            if (validateAdminCredentials(username, enteredPassword)) {
                adminPanel();
            } else {
                JOptionPane.showMessageDialog(null, "Incorrect username or password!");
            }
        }
    }

    private boolean validateAdminCredentials(String username, String password) {
        return admins.stream().anyMatch(admin -> admin.getUsername().equals(username) && admin.getPassword().equals(password));
    }

    private void adminPanel() {
        JPanel panel = new JPanel(new GridLayout(6, 2, 10, 10));
        panel.setBackground(new Color(255, 228, 196)); 

        JTextField movieNameField = new JTextField();
        JTextField priceField = new JTextField();
        JTextField availableSeatsField = new JTextField();
        JTextField dateField = new JTextField();
        JTextField posterPathField = new JTextField();
        JButton addButton = new JButton("Add Movie");
        styleButton(addButton);

        panel.add(new JLabel("Movie Name:"));
        panel.add(movieNameField);
        panel.add(new JLabel("Price:"));
        panel.add(priceField);
        panel.add(new JLabel("Available Seats:"));
        panel.add(availableSeatsField);
        panel.add(new JLabel("Date:"));
        panel.add(dateField);
        panel.add(new JLabel("Poster Path:"));
        panel.add(posterPathField);
        panel.add(new JLabel("")); 
        panel.add(addButton);

        addButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String movieName = movieNameField.getText();
                int price = Integer.parseInt(priceField.getText());
                int availableSeats = Integer.parseInt(availableSeatsField.getText());
                String date = dateField.getText();
                String posterPath = posterPathField.getText();

                Movie movie = new Movie(movieName, price, availableSeats, date, posterPath);
                movies.add(movie);
                dbManager.saveMovie(movie);

                JOptionPane.showMessageDialog(null, "Movie added successfully!");
            }
        });

        JOptionPane.showMessageDialog(null, panel);
    }

    
    private void loadMovies() {
        movies = dbManager.loadMovies();
    }

    private void loadAdmins() {
        admins = dbManager.loadAdmins();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                new CinemaManagementSystem().setVisible(true);
            }
        });
    }
}
