import React, { useState, useEffect } from 'react';
import { useLanguage } from "../../languagecontext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Rating,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Divider
} from '@mui/material';
import { AddCircle, Delete } from '@mui/icons-material';

const ManagerFeedbackView = ({ 
  coldFeedbacks = [], 
  hotFeedbacks = [],
  onSaveFeedback,
}) => {
  const { t } = useLanguage();
  const [feedbackType, setFeedbackType] = useState('cold');
  const [customFields, setCustomFields] = useState([]);
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [feedbackData, setFeedbackData] = useState({});
  const [editingFeedback, setEditingFeedback] = useState(null);

  useEffect(() => {
    if (editingFeedback) {
      setFeedbackData(editingFeedback.data);
      setCustomFields(editingFeedback.fields || []);
      setFeedbackType(editingFeedback.type);
    } else {
      setFeedbackData({});
      setCustomFields([]);
    }
  }, [editingFeedback]);

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    
    const field = {
      id: Date.now().toString(),
      type: newFieldType,
      label: newFieldLabel,
      required: newFieldRequired
    };
    
    setCustomFields([...customFields, field]);
    setNewFieldLabel('');
    setNewFieldRequired(false);
  };

  const handleRemoveField = (id) => {
    setCustomFields(customFields.filter(field => field.id !== id));
    const newData = {...feedbackData};
    delete newData[id];
    setFeedbackData(newData);
  };

  const handleFieldChange = (fieldId, value) => {
    setFeedbackData({
      ...feedbackData,
      [fieldId]: value
    });
  };

  const renderFieldInput = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={feedbackData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            multiline
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            value={feedbackData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'rating':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{field.label}</Typography>
            <Rating
              value={Number(feedbackData[field.id]) || 0}
              onChange={(e, newValue) => handleFieldChange(field.id, newValue)}
            />
          </Box>
        );
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(feedbackData[field.id])}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              />
            }
            label={field.label}
          />
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    const feedback = {
      type: feedbackType,
      data: feedbackData,
      fields: customFields,
      createdAt: new Date().toISOString()
    };
    
    onSaveFeedback(feedback);
    setEditingFeedback(null);
    setFeedbackData({});
    setCustomFields([]);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('managerFeedbackTitle')}
      </Typography>
      
      {/* Feedback type selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{t('feedbackType')}</InputLabel>
        <Select
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          label={t('feedbackType')}
        >
          <MenuItem value="cold">{t('coldFeedback')}</MenuItem>
          <MenuItem value="hot">{t('hotFeedback')}</MenuItem>
          <MenuItem value="custom">{t('customFeedback')}</MenuItem>
        </Select>
      </FormControl>
      
      {/* Existing feedbacks */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('existingFeedbacks')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant={feedbackType === 'cold' ? 'contained' : 'outlined'}
            onClick={() => setFeedbackType('cold')}
          >
            {t('coldFeedbacks')} ({coldFeedbacks.length})
          </Button>
          <Button 
            variant={feedbackType === 'hot' ? 'contained' : 'outlined'}
            onClick={() => setFeedbackType('hot')}
          >
            {t('hotFeedbacks')} ({hotFeedbacks.length})
          </Button>
        </Box>
        
        {(feedbackType === 'cold' ? coldFeedbacks : hotFeedbacks).map((fb, index) => (
          <Box 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid #ddd', 
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
            onClick={() => setEditingFeedback(fb)}
          >
            <Typography variant="subtitle1">
              {fb.data?.theme || t('untitledFeedback')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(fb.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Custom form builder */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editingFeedback ? t('editFeedback') : t('createNewFeedback')}
        </Typography>
        
        {/* Form fields */}
        {customFields.map((field) => (
          <Box key={field.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              {renderFieldInput(field)}
            </Box>
            <IconButton onClick={() => handleRemoveField(field.id)}>
              <Delete color="error" />
            </IconButton>
          </Box>
        ))}
        
        {/* Add new field */}
        <Box sx={{ 
          p: 2, 
          border: '1px dashed #ccc', 
          borderRadius: 1,
          mb: 3
        }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('addNewField')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t('fieldType')}</InputLabel>
              <Select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                label={t('fieldType')}
              >
                <MenuItem value="text">{t('textField')}</MenuItem>
                <MenuItem value="number">{t('numberField')}</MenuItem>
                <MenuItem value="rating">{t('ratingField')}</MenuItem>
                <MenuItem value="checkbox">{t('checkboxField')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label={t('fieldLabel')}
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                />
              }
              label={t('required')}
            />
            
            <IconButton onClick={handleAddField} color="primary">
              <AddCircle />
            </IconButton>
          </Box>
        </Box>
        
        {/* Basic info for the feedback */}
        <TextField
          fullWidth
          label={t('feedbackTitle')}
          value={feedbackData.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label={t('description')}
          value={feedbackData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
      </Box>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {editingFeedback && (
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => setEditingFeedback(null)}
          >
            {t('cancel')}
          </Button>
        )}
        
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={customFields.length === 0}
        >
          {editingFeedback ? t('updateFeedback') : t('saveFeedback')}
        </Button>
      </Box>
    </Box>
  );
};

export default ManagerFeedbackView;