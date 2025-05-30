/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Badge from '@material-ui/core/Badge';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { Attendee, ResponseStatusMap } from '../api';

const useStyles = makeStyles(theme => {
  const getIconColor = (responseStatus?: string) => {
    if (!responseStatus) return theme.palette.primary.light;

    return {
      [ResponseStatusMap.accepted]: theme.palette.status.ok,
      [ResponseStatusMap.declined]: theme.palette.status.error,
    }[responseStatus];
  };

  return {
    responseStatus: {
      color: ({ responseStatus }: { responseStatus?: string }) =>
        getIconColor(responseStatus),
    },
    badge: {
      right: 10,
      top: 5,
      '& svg': {
        height: 16,
        width: 16,
        background: theme.palette.common.white,
      },
    },
  };
});

const ResponseIcon = ({ responseStatus }: { responseStatus: string }) => {
  if (responseStatus === ResponseStatusMap.accepted) {
    return <CheckIcon data-testid="accepted-icon" />;
  }
  if (responseStatus === ResponseStatusMap.declined) {
    return <CancelIcon data-testid="declined-icon" />;
  }

  return null;
};

type AttendeeChipProps = {
  user: Attendee;
};

export const AttendeeChip = ({ user }: AttendeeChipProps) => {
  const classes = useStyles({ responseStatus: user.status?.response || '' });

  return (
    <Badge
      classes={{
        root: classes.responseStatus,
        badge: classes.badge,
      }}
      badgeContent={
        <ResponseIcon responseStatus={user.status?.response || ''} />
      }
    >
      <Chip
        size="small"
        variant="outlined"
        label={user.emailAddress?.address}
        color="primary"
      />
    </Badge>
  );
};
