import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider, TextField,Grid,
    Typography
} from '@mui/material';
import {Line} from 'react-chartjs-2';
import {CategoryScale, Chart, LinearScale, LineElement, LogarithmicScale, PointElement} from 'chart.js';
import {DistributionParams, DistributionType} from "../types.ts";
import {getProbFromParams,
} from "./distributionFormulas.ts";
import {defaultParamsByDistribution} from "./distributionConfigs.ts";



interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (params: DistributionParams) => void;
    initialValue?: DistributionParams;
    duration?: number
}

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, LogarithmicScale);



const DistributionModal: React.FC<Props> = ({open, onClose, onConfirm, initialValue, duration}) => {
    const [distribution, setDistribution] = useState<DistributionType>(initialValue?.type || 'NORMAL');
    const [params, setParams] = useState<DistributionParams>({
        type: initialValue?.type || 'NORMAL',
        // fixedTime: 100,
        // value: 0.01,
        // mean: 100,
        // std: 10,
        // scalingFactorX: 0.1,
        // scalingFactorY: 0.1,
        // scalingFactor: 1,
        // rate: 0.01,
        time: 1,
        ...initialValue
    });
    const [yRange, setYRange] = useState<number>(1);
    const [yScaleType, setYScaleType] = useState<'linear' | 'logarithmic'>('linear');
    const [offsetStart, setOffsetStart] = useState<number>(0);
    const windowSize = 1000;
    useEffect(() => {
        if (initialValue?.type) {
            setDistribution(initialValue.type);
            setParams({ ...initialValue });
        }
    }, [initialValue]);
    const [sliderSettings, setSliderSettings] = useState({
        mean: { label: 'Mean', min: 1, max: duration || 100, step: 1 },
        std: { label: 'Std Dev', min: 0.1, max: 3000, step: 0.1 },
        scalingFactorX: { label: 'Scaling FactorX', min: 0.1, max: 3000, step: 0.1 },
        scalingFactorY: { label: 'Scaling FactorY', min: 0.001, max: 3000, step: 0.001 },
        value: { label: 'Value', min: 0.00001, max: 1, step: 0.0001 },
    });

    const handleDistributionChange = (type: DistributionType) => {
        setDistribution(type);
        setParams({ ...defaultParamsByDistribution[type] });
    };


    const renderSliderEditor = (key: keyof DistributionParams) => {
        if (typeof params[key] !== 'number') return null;

        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const min = sliderSettings[key]?.min ?? 0;
        const max = sliderSettings[key]?.max ?? 1000;
        const step = sliderSettings[key]?.step ?? 1;


        return (
            <Box key={key} sx={{ my: 1, px: 2, py: 1, border: '1px solid #ddd', borderRadius: 1.5 }}>
                <Grid container spacing={1} alignItems="center" wrap="nowrap">
                    <Grid item sx={{ width: 150 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{label}</Typography>
                    </Grid>
                    <Grid item sx={{ width: 400 }}>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>{params[key]}</Typography>
                        <Slider
                            min={min}
                            max={max}
                            step={step}
                            value={params[key] as number}
                            onChange={handleParamChange(key)}
                            size="small"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            size="small"
                            label="Val"
                            type="number"
                            value={params[key]}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setParams(prev => ({ ...prev, [key]: isNaN(value) ? prev[key] : value }));
                            }}
                            step={step}
                            sx={{ width: 120 }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            size="small"
                            label="Min"
                            type="number"
                            value={min}
                            onChange={handleSliderSettingChange(key, 'min')}
                            sx={{ width: 120 }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            size="small"
                            label="Max"
                            type="number"
                            value={max}
                            onChange={handleSliderSettingChange(key, 'max')}
                            sx={{ width: 120 }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            size="small"
                            label="Step"
                            type="number"
                            value={step}
                            onChange={handleSliderSettingChange(key, 'step')}
                            sx={{ width: 120 }}
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const handleSliderSettingChange = (key, field) => (e) => {
        const value = parseFloat(e.target.value);
        setSliderSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: isNaN(value) ? prev[key][field] : value
            }
        }));
    };

    const handleParamChange = (name: keyof DistributionParams) => (_: Event, value: number | number[]) => {
        setParams(prev => ({...prev, [name]: value as number}));
    };

    const handleConfirm = () => {
        onConfirm({type: distribution, ...params});
    };


    const getProb = (t: number): number => {
        return getProbFromParams(distribution, t, params);
    };

    const POINTS = 300;

    const generateData = () => {
        const data: { x: number, y: number }[] = [];
        const step = windowSize / POINTS;
        for (let i = 0; i <= POINTS; i++) {
            const t = offsetStart + i * step;
            const prob = getProb(t);
            data.push({ x: t, y: Math.max(prob, 1e-6) }); // evita log(0)
        }
        return data;
    };

    const generatePreviewData = () => {
        const PREVIEW_POINTS = 100;
        const totalDuration = duration || 604800;
        const step = totalDuration / PREVIEW_POINTS;

        const data: { x: number, y: number }[] = [];
        for (let i = 0; i <= PREVIEW_POINTS; i++) {
            const t = i * step;
            const prob = getProb(t);
            data.push({ x: t, y: Math.max(prob, 1e-6) });
        }
        return data;
    };


    // const maxY = Math.max(...generateData().map(d => d.y));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Configure Distribution</DialogTitle>
            <DialogContent>
                <Box sx={{mt: 2}}>
                    <Grid container spacing={1} alignItems="center" wrap="nowrap">
                        {/* Label sopra */}
                        <Grid item sx={{ width: 150 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="distribution-label">Distribution</InputLabel>
                                <Select
                                    labelId="distribution-label"
                                    value={distribution}
                                    label="Distribution"
                                    onChange={e => handleDistributionChange(e.target.value as DistributionType)}
                                >
                                    {[
                                        'FIXED', 'UNIFORM', 'NORMAL', 'NORMAL_SCALED',
                                        'LOGNORMAL', 'LOGNORMAL_SCALED', 'EXPONENTIAL', 'EXPONENTIAL_SCALED'
                                    ].map(d => (
                                        <MenuItem key={d} value={d}>{d}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Offset Start */}
                        <Grid item sx={{ width: 600 }}>
                            <Typography variant="body2" gutterBottom>
                                Offset Start: <strong>{offsetStart}</strong>
                            </Typography>
                            <Slider

                                size="small"
                                min={0}
                                max={Math.max(0, (duration || 60000) - windowSize)}
                                step={100}
                                value={offsetStart}
                                onChange={(_, v) => setOffsetStart(v as number)}
                            />

                        </Grid>

                        {/* Probability Range */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" gutterBottom>
                                Max Probability (Y Range): <strong>{yRange}</strong>
                            </Typography>
                            <Slider
                                size="small"
                                min={0}
                                max={1}
                                step={0.0001}
                                value={yRange}
                                onChange={(_, v) => setYRange(v as number)}
                            />
                        </Grid>
                    </Grid>

                    <Divider textAlign={'left'}>Distribution Parameters</Divider>

                    {
                        Object.keys(defaultParamsByDistribution[distribution] || {}).map((key) =>
                            renderSliderEditor(key as keyof DistributionParams)
                        )
                    }

                    <Typography variant="subtitle2" sx={{ mt: 3 }}>Preview (entire distribution)</Typography>
                    <Line
                        data={{
                            datasets: [{
                                label: 'Preview Curve',
                                data: generatePreviewData(),
                                borderColor: 'gray',
                                borderWidth: 1,
                                pointRadius: 0,
                                fill: false,
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'linear',
                                    title: { display: true, text: 'Full Time Range' },
                                    min: 0,
                                    max: duration || 604800,
                                },
                                y: {
                                    type: yScaleType,
                                    beginAtZero: yScaleType === 'linear',
                                    max: yRange,
                                    title: { display: true, text: 'Probability' },
                                    ticks: {
                                        callback: (value) => yScaleType === 'logarithmic'
                                            ? Number(value).toExponential(1)
                                            : value,
                                    }
                                }
                            }
                        }}
                    />

                    {/*<Typography variant="body2" sx={{mb: 1}}>Max Y ≈ {maxY.toExponential(2)}</Typography>*/}
                    <Typography variant="subtitle2" sx={{ mt: 3 }}>Preview partial distribution (1000 seconds window)</Typography>

                    <Line
                        data={{
                            datasets: [{
                                label: `${distribution} Probability`,
                                data: generateData(),
                                borderWidth: 2,
                                fill: true,
                                pointRadius: 0,
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                x: {type: 'linear', title: {display: true, text: 'Time'}},
                                y: {
                                    max: yRange,
                                    // type: yScaleType,
                                    title: {display: true, text: 'Probability'},
                                    beginAtZero: true,
                                }
                            }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleConfirm} variant="contained">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DistributionModal;



