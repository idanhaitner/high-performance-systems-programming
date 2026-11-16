double new_total(double total, double share, double speedup) {
    double part = total * share;
    return (total - part) + part / speedup;
}
