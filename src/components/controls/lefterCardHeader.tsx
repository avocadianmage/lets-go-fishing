import { CardHeader, Theme, TypographyProps } from '@mui/material';

export const LefterCardHeaderTypographyProps: TypographyProps = {
    fontSize: '0.75rem',
    color: (theme: Theme) => theme.palette.grey[500],
    textTransform: 'uppercase',
};

export const LefterCardHeader = ({ title }: { title: string }) => {
    return (
        <CardHeader
            titleTypographyProps={LefterCardHeaderTypographyProps}
            title={title}
            sx={{ backgroundColor: 'rgb(18,18,18)' }}
        />
    );
};
