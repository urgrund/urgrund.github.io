

const serverURL = '../dev/php/';
class ServerInfo {

    static URL_GetSiteData = serverURL + 'get_site_data.php';
    static URL_Admin = serverURL + 'admin.php';
    static URL_Longterm = serverURL + 'longterm.php';
    static URL_Reporting = serverURL + 'reports.php';
    static URL_Monthly = serverURL + 'monthly/monthly.php';


    static config = undefined;
    static availableDates = undefined;

    // Refresh interval in seconds for the days data
    static dailyRefreshInterval = 15 * 60;


    static shiftTargetAgressiveScalar = (1.0 / 0.85);

    static shiftTargetProductionProfile = [
        0.00875,
        0.02445,
        0.06657,
        0.11507,
        0.16507,
        0.21353,
        0.26159,
        0.30929,
        0.35863,
        0.40960,
        0.46076,
        0.47911,
        0.48629,
        0.50662,
        0.55341,
        0.60626,
        0.65994,
        0.71321,
        0.76534,
        0.81814,
        0.87174,
        0.92729,
        0.98198,
        1.00000
    ];
}


class ConnectionStatus {
    constructor() {
        this.status = 0;
        this.messages = "";
        this.text = "";
    }
}