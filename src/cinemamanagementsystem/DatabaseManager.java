/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package CinemaManagementSystem;

import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:ucanaccess://C:\\Users\\INTEL\\Documents\\NetBeansProjects\\CinemaManagementSystem\\cinema_db.accdb";

    public ArrayList<Movie> loadMovies() {
        ArrayList<Movie> movies = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String query = "SELECT * FROM Movies";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(query)) {
                while (rs.next()) {
                    String name = rs.getString("movie_name");
                    int price = rs.getInt("price");
                    int availableSeats = rs.getInt("available_seats");
                    String date = rs.getString("date");
                    String posterPath = rs.getString("poster_path");
                    movies.add(new Movie(name, price, availableSeats, date, posterPath));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return movies;
    }

    public void saveMovie(Movie movie) {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String query = "INSERT INTO Movies (movie_name, price, available_seats, date, poster_path) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                stmt.setString(1, movie.getName());
                stmt.setInt(2, movie.getPrice());
                stmt.setInt(3, movie.getAvailableSeats());
                stmt.setString(4, movie.getDate());
                stmt.setString(5, movie.getPosterPath());
                stmt.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public ArrayList<Admin> loadAdmins() {
        ArrayList<Admin> admins = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String query = "SELECT * FROM Admins";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(query)) {
                while (rs.next()) {
                    String username = rs.getString("username");
                    String password = rs.getString("password");
                    admins.add(new Admin(username, password));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return admins;
    }

    public void updateBookedSeats(String movie, int seats) {
        try (Connection conn = DriverManager.getConnection(DB_URL)) {
            String query = "UPDATE BookedSeats SET booked_seats = ? WHERE movie_name = ?";
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                stmt.setInt(1, seats);
                stmt.setString(2, movie);
                stmt.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
