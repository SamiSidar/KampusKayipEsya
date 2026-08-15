package com.yeditepe.kampuskayipesya.dto;

/**
 * ProfileUpdateRequest — Profil güncelleme isteği.
 * Sadece verilen alanlar güncellenir (null olanlar dokunulmaz).
 */
public class ProfileUpdateRequest {

    private String fullName;
    private String phoneNumber;
    private String department;

    public ProfileUpdateRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
