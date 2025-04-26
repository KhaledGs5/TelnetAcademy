import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Rating,
  Typography
} from '@mui/material';
import { useLanguage } from "../languagecontext";

const FormPreview = ({ formFields, fieldValues = [] }) => {
  const { t } = useLanguage();

  const valuesMap = fieldValues.reduce((acc, response) => {
    acc[response.fieldId] = response.value;
    return acc;
  }, {});

  const renderField = (field) => {
    const value = valuesMap[field.id];
    
    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.id}
            label={field.label || t('text_field')}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
              sx: { cursor: 'pointer' }
            }}
            sx={{ '& .MuiInputBase-input': { cursor: 'pointer' } }}
            value={value || ''}
          />
        );
      case 'rating':
        return (
          <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || t('rating')} {field.required && '*'}
            </Typography>
            <Rating
              name={`rating-${field.id}`}
              precision={0.5}
              value={Number(value) || 0}
              readOnly
              sx={{ '& .MuiRating-icon': { cursor: 'pointer' } }}
            />
          </Box>
        );
      case 'checkbox':
        return (
          <FormControl key={field.id} component="fieldset" sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || t('checkbox')} {field.required && '*'}
            </Typography>
            {field.options.length > 0 ? (
              field.options.map((option, index) => (
                <FormControlLabel
                  key={`${field.id}-${index}`}
                  control={
                    <Checkbox
                      name={`${field.id}-${index}`}
                      checked={value?.[option.value] || false}
                      readOnly
                      sx={{ '& .MuiSvgIcon-root': { cursor: 'pointer' } }}
                    />
                  }
                  label={option.label || `${t('option')} ${index + 1}`}
                  sx={{ cursor: 'pointer' }}
                />
              ))
            ) : (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={value || false} 
                    readOnly 
                    sx={{ '& .MuiSvgIcon-root': { cursor: 'pointer' } }}
                  />
                }
                label={t('checkbox_option')}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </FormControl>
        );
      case 'radio':
        return (
          <FormControl key={field.id} component="fieldset" sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || t('radio_group')} {field.required && '*'}
            </Typography>
            <RadioGroup value={value || ''}>
              {field.options.length > 0 ? (
                field.options.map((option, index) => (
                  <FormControlLabel
                    key={`${field.id}-${index}`}
                    value={option.value}
                    control={
                      <Radio 
                        readOnly 
                        sx={{ '& .MuiSvgIcon-root': { cursor: 'pointer' } }} 
                      />
                    }
                    label={option.label || `${t('option')} ${index + 1}`}
                    sx={{ cursor: 'pointer' }}
                  />
                ))
              ) : (
                <FormControlLabel
                  value="option1"
                  control={
                    <Radio 
                      readOnly 
                      sx={{ '& .MuiSvgIcon-root': { cursor: 'pointer' } }} 
                    />
                  }
                  label={t('radio_option')}
                  sx={{ cursor: 'pointer' }}
                />
              )}
            </RadioGroup>
          </FormControl>
        );
      default:
        return null;
    }
  };
  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
        borderRadius: '10px',
        padding: '10px',
        gap: "2px",
      }}
    >    
      {formFields.length > 0 ? (
        formFields.map(field => renderField(field))
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t("no_fields_preview_message")}
        </Typography>
      )}
    </Box>
  );
};

export default FormPreview;