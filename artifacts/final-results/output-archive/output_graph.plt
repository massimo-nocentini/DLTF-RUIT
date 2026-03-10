set terminal png size 800,600
set output './output/./output_graph.png'
set title ''
set xlabel ''
set ylabel ''
set key inside top left
set style data lines

# data file alias: 3.2.DAO-TwoPeaks-GartenerVote (270) = ./output/3.2.DAO-TwoPeaks-GartenerVote_t1209600_aggr3600_20250705094618.tsv

plot \
    './output/3.2.DAO-TwoPeaks-GartenerVote_t1209600_aggr3600_20250705094618.tsv' using 1:27 with lines title '' lc rgb '#000000' linewidth 1.0 smooth unique
