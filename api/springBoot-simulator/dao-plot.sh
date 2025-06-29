#!/bin/zsh

# ============================================================================
# Input Files Configuration
# ============================================================================
file1="output/DAO-14gg-hour_t1209600_aggr3600_*.tsv"
file2="output/DAO-UniformProposal-DynamicVote_t1209600_aggr3600_*.tsv"
file3="output/DAO-UniformProposal-GartnerVote_t1209600_aggr3600_*.tsv"
file4="output/DAO-TwoPeaks-UserVoteDynamic_t1209600_aggr3600_*.tsv"
file5="output/DAO-2PeakUsers-and-Proposal_t1209600_aggr3600_*.tsv"
file6="output/DAO-peakOnProposal_t1209600_aggr3600_*.tsv"

# Check if files exist
for f in $file1 $file2 $file3 $file4 $file5 $file6; do
    if [[ ! -f "$f" ]]; then
        echo "Error: Input file $f not found"
        exit 1
    fi
done

# Create output/img directory
mkdir -p output/img

# ============================================================================
# Common Gnuplot Settings
# ============================================================================
common_settings="
set terminal png size 1600,1000 enhanced
set grid ytics lt 1 lc rgb '#dddddd' lw 1
set grid xtics lt 1 lc rgb '#dddddd' lw 1
set xrange [0:1209600]
set yrange [0:*]
set key outside right center vertical box width 2
set border 3 lw 2
set style fill transparent solid 0.2

# Time axis formatting (convert seconds to days)
set xtics ('0' 0, '2d' 172800, '4d' 345600, '6d' 518400, '8d' 691200, '10d' 864000, '12d' 1036800, '14d' 1209600)

# Font settings
set xtics font 'Times-New-Roman,12'
set ytics font 'Times-New-Roman,12'
set xlabel font 'Times-New-Roman,14'
set ylabel font 'Times-New-Roman,14'
set title font 'Times-New-Roman,16' noenhanced
set key font 'Times-New-Roman,11'
set xlabel 'Time (days)'

# Add minor gridlines
set mxtics 2
set mytics 2
set grid mxtics mytics lt 1 lc rgb '#eeeeee' lw 0.5
"

# ============================================================================
# Plot Users
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_Users_trend.png'
set title 'Users Comparison'
set ylabel 'Number of Users'

plot '$file1' using 1:2 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:2 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:2 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:2 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:2 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:2 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Proposals
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_Proposals_trend.png'
set title 'Proposals Comparison'
set ylabel 'Number of Proposals'

plot '$file1' using 1:3 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:3 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:3 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:3 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:3 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:3 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Votes
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_Votes_trend.png'
set title 'Votes Comparison'
set ylabel 'Number of Votes'

plot '$file1' using 1:4 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:4 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:4 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:4 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:4 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:4 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Total Users
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_TotalUsers_trend.png'
set title 'Total Users Comparison'
set ylabel 'Total Number of Users'

plot '$file1' using 1:26 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:26 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:26 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:26 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:26 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:26 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Total Proposals
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_TotalProposals_trend.png'
set title 'Total Proposals Comparison'
set ylabel 'Total Number of Proposals'

plot '$file1' using 1:16 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:16 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:16 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:16 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:16 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:16 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Total Votes
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_TotalVotes_trend.png'
set title 'Total Votes Comparison'
set ylabel 'Total Number of Votes'

plot '$file1' using 1:21 smooth bezier with lines lw 3 lc 'skyblue' title 'Base DAO', \
     '$file2' using 1:21 smooth bezier with lines lw 3 lc 'forest-green' title 'Uniform Proposal Dynamic Vote', \
     '$file3' using 1:21 smooth bezier with lines lw 3 lc 'dark-orange' title 'Uniform Proposal Gartner Vote', \
     '$file4' using 1:21 smooth bezier with lines lw 3 lc 'purple' title 'Two Peaks User Vote Dynamic', \
     '$file5' using 1:21 smooth bezier with lines lw 3 lc 'red' title '2 Peak Users and Proposal', \
     '$file6' using 1:21 smooth bezier with lines lw 3 lc 'brown' title 'Peak On Proposal'
EOF

# ============================================================================
# Plot Average Users Per Run with Error Bars
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_AvgUsersPerRun.png'
set title 'Average Users Per Run Comparison'
set ylabel 'Average Number of Users per Run'
set bars 4.0

# Plot filled curves with error bars
plot '$file1' using 1:27 smooth bezier with lines lw 3 lc rgb '#6495ED' title 'Base DAO', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#6495ED' notitle, \
     '$file2' using 1:27 smooth bezier with lines lw 3 lc rgb '#228B22' title 'Uniform Proposal Dynamic Vote', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#228B22' notitle, \
     '$file3' using 1:27 smooth bezier with lines lw 3 lc rgb '#FF8C00' title 'Uniform Proposal Gartner Vote', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#FF8C00' notitle, \
     '$file4' using 1:27 smooth bezier with lines lw 3 lc rgb '#9370DB' title 'Two Peaks User Vote Dynamic', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#9370DB' notitle, \
     '$file5' using 1:27 smooth bezier with lines lw 3 lc rgb '#DC143C' title '2 Peak Users and Proposal', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#DC143C' notitle, \
     '$file6' using 1:27 smooth bezier with lines lw 3 lc rgb '#8B4513' title 'Peak On Proposal', \
     '' using 1:27:(\$27-\$28):(\$27+\$28) with filledcurves lc rgb '#8B4513' notitle
EOF

# ============================================================================
# Plot Average Proposals Per Run with Error Bars
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_AvgProposalsPerRun.png'
set title 'Average Proposals Per Run Comparison'
set ylabel 'Average Number of Proposals per Run'
set bars 4.0

# Plot filled curves with error bars
plot '$file1' using 1:17 smooth bezier with lines lw 3 lc rgb '#6495ED' title 'Base DAO', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#6495ED' notitle, \
     '$file2' using 1:17 smooth bezier with lines lw 3 lc rgb '#228B22' title 'Uniform Proposal Dynamic Vote', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#228B22' notitle, \
     '$file3' using 1:17 smooth bezier with lines lw 3 lc rgb '#FF8C00' title 'Uniform Proposal Gartner Vote', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#FF8C00' notitle, \
     '$file4' using 1:17 smooth bezier with lines lw 3 lc rgb '#9370DB' title 'Two Peaks User Vote Dynamic', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#9370DB' notitle, \
     '$file5' using 1:17 smooth bezier with lines lw 3 lc rgb '#DC143C' title '2 Peak Users and Proposal', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#DC143C' notitle, \
     '$file6' using 1:17 smooth bezier with lines lw 3 lc rgb '#8B4513' title 'Peak On Proposal', \
     '' using 1:17:(\$17-\$18):(\$17+\$18) with filledcurves lc rgb '#8B4513' notitle
EOF

# ============================================================================
# Plot Average Votes Per Run with Error Bars
# ============================================================================
gnuplot << EOF
$common_settings
set output './output/img/dao_comparison_AvgVotesPerRun.png'
set title 'Average Votes Per Run Comparison'
set ylabel 'Average Number of Votes per Run'
set bars 4.0

# Plot filled curves with error bars
plot '$file1' using 1:22 smooth bezier with lines lw 3 lc rgb '#6495ED' title 'Base DAO', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#6495ED' notitle, \
     '$file2' using 1:22 smooth bezier with lines lw 3 lc rgb '#228B22' title 'Uniform Proposal Dynamic Vote', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#228B22' notitle, \
     '$file3' using 1:22 smooth bezier with lines lw 3 lc rgb '#FF8C00' title 'Uniform Proposal Gartner Vote', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#FF8C00' notitle, \
     '$file4' using 1:22 smooth bezier with lines lw 3 lc rgb '#9370DB' title 'Two Peaks User Vote Dynamic', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#9370DB' notitle, \
     '$file5' using 1:22 smooth bezier with lines lw 3 lc rgb '#DC143C' title '2 Peak Users and Proposal', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#DC143C' notitle, \
     '$file6' using 1:22 smooth bezier with lines lw 3 lc rgb '#8B4513' title 'Peak On Proposal', \
     '' using 1:22:(\$22-\$23):(\$22+\$23) with filledcurves lc rgb '#8B4513' notitle
EOF
