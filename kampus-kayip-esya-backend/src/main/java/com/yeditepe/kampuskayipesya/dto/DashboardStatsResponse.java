package com.yeditepe.kampuskayipesya.dto;

public class DashboardStatsResponse {

    private long totalFoundItems;
    private long totalLostReports;
    private long pendingReports;
    private long pendingClaims;
    private long totalDeliveries;
    private long totalUsers;

    public DashboardStatsResponse() {
    }

    public long getTotalFoundItems() {
        return totalFoundItems;
    }

    public void setTotalFoundItems(long totalFoundItems) {
        this.totalFoundItems = totalFoundItems;
    }

    public long getTotalLostReports() {
        return totalLostReports;
    }

    public void setTotalLostReports(long totalLostReports) {
        this.totalLostReports = totalLostReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getPendingClaims() {
        return pendingClaims;
    }

    public void setPendingClaims(long pendingClaims) {
        this.pendingClaims = pendingClaims;
    }

    public long getTotalDeliveries() {
        return totalDeliveries;
    }

    public void setTotalDeliveries(long totalDeliveries) {
        this.totalDeliveries = totalDeliveries;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }
}
