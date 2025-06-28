import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Modal, IconButton, Tooltip } from '@mui/material';
import { Info, Code } from '@mui/icons-material';
import {CsvFileDTO} from "../types/types.ts";

interface FileSelectorProps {
    csvFiles: CsvFileDTO[];
    selectedFiles: { [key: string]: CsvFileDTO };
    handleFileSelection: (file: CsvFileDTO) => void;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto'
};

const FileSelector: React.FC<FileSelectorProps> = ({ csvFiles, selectedFiles, handleFileSelection }) => {
    const [selectedJson, setSelectedJson] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const handleOpenModal = (json: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedJson(json);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedJson(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Select Data Files</Typography>
            <Grid container spacing={2}>
                {csvFiles.map(file => {
                    const alias = `${file.name} (${file.id})`;
                    const formattedDate = formatDate(file.createdAt);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={file.id}>
                            <Paper
                                sx={{
                                    p: 2,
                                    border: selectedFiles[alias] ? '2px solid #1976d2' : '1px solid #ddd',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => handleFileSelection(file)}
                            >
                                <Typography variant="subtitle1">{file.name}</Typography>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    ID: {file.id}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    Created: {formattedDate}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" display="block">
                                    Columns: {file.columns.length}
                                </Typography>
                                
                                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                    {file.configurationJson && (
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => handleOpenModal(file.configurationJson, e)}
                                            sx={{ mr: 1 }}
                                        >
                                            <Code fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="json-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="json-modal-title" variant="h6" component="h2" gutterBottom>
                        Simulation Configuration
                    </Typography>
                    <Box 
                        component="pre" 
                        sx={{ 
                            bgcolor: '#f5f5f5', 
                            p: 2, 
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 'calc(80vh - 100px)'
                        }}
                    >
                        {selectedJson ? JSON.stringify(JSON.parse(selectedJson), null, 2) : ''}
                    </Box>
                </Box>
            </Modal>
        </Paper>
    );
};

export default FileSelector;