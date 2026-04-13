/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package CinemaManagementSystem;

public class Movie {
    private String name;
    private int price;
    private int availableSeats;
    private String date;
    private int bookedSeats;
    private String posterPath;

    public Movie(String name, int price, int availableSeats, String date, String posterPath) {
        this.name = name;
        this.price = price;
        this.availableSeats = availableSeats;
        this.date = date;
        this.bookedSeats = 0;
        this.posterPath = posterPath;
    }

   
    public String getName() { return name; }
    public int getPrice() { return price; }
    public int getAvailableSeats() { return availableSeats; }
    public String getDate() { return date; }
    public int getBookedSeats() { return bookedSeats; }
    public String getPosterPath() { return posterPath; }

    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }
    public void setBookedSeats(int bookedSeats) { this.bookedSeats = bookedSeats; }
}
