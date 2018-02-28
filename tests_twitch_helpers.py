"""Tests for twitch_helpers."""
from unittest import TestCase, mock
from io import StringIO
import datetime
import sqlalchemy
import server as s
import model as m
from model import connect_to_db, db
from seed_testdb import sample_data
import template_helpers as temp_help
import twitch_helpers


###############################################################################
# TWITCH HELPERS TESTS
###############################################################################

# Patching response for twitch users
@mock.patch("twitch_helpers.requests.get")
def test_getting_user_when_response_is_ok(mock_get_streams):
    twitch_user = {
        "data": [
            {
                "id": "27629046016",
                "user_id": "29389795",
                "game_id": "497428",
                "community_ids": [],
                "type": "live",
                "title": "Testing the stream",
                "viewer_count": 1,
                "started_at": "2018-02-16T21:04:02Z",
                "language": "en",
                "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_pixxeltesting-{width}x{height}.jpg"
            }
        ],
        "pagination": {
            "cursor": "eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MX19"
        }
    }
    # Mock will respond with 200 code status.
    # Mock has a `json()` method that returns Twitch user data
    mock_get_streams.return_value = mock.MagicMock(
        status_code=200,
        json=twitch_user)


class TwitchHelpersTestCase(TestCase):

    twitch_token = mock.Mock(spec=m.TwitchToken,
                             access_token="imagreattoken")

    user = mock.Mock(spec=m.User,
                     twitch_token=twitch_token,
                     twitch_id=29389795)

    def test_create_header(self):
        """Checks for accurate header creation for Twitch API requests."""

        token = "imagreattoken"
        expected_header = {"Authorization": "Bearer {}".format(token)}

        self.assertEqual(twitch_helpers.create_header(self.user),
                         expected_header)

    def test_check_response_status(self):
        """Tests checking status code of Twitch responses."""
        ok_response = mock.Mock(status_code=200)
        unauth_response = mock.Mock(status_code=401)
        bad_response = mock.Mock(status_code=500)

        self.assertTrue(twitch_helpers.check_response_status(ok_response))
        self.assertRaises(Exception,
                          twitch_helpers.check_response_status,
                          unauth_response)
        self.assertRaises(Exception,
                          twitch_helpers.check_response_status,
                          bad_response)

    @mock.patch("twitch_helpers.requests.get")
    def test_get_stream_info(self, get_streams):
        """Checks if getting stream info works."""

        get_streams.return_value = mock.Mock(
            spec=twitch_helpers.requests.Response)

        twitch_helpers.get_stream_info(self.user)
        self.assertTrue(twitch_helpers.get_stream_info(self.user))

    @mock.patch("twitch_helpers.get_stream_info")
    def test_is_twitch_online(self, get_streams):
        """Checks if returning t/f is accurate for user's online status."""

        json = {
            "data": [
                {
                    "id": "27629046016",
                    "user_id": "29389795",
                    "game_id": "497428",
                    "community_ids": [],
                    "type": "live",
                    "title": "Testing the stream",
                    "viewer_count": 1,
                    "started_at": "2018-02-16T21:04:02Z",
                    "language": "en",
                    "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_pixxeltesting-{width}x{height}.jpg"
                }
            ],
            "pagination": {
                "cursor": "eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MX19"
            }
        }

        # Creates mock reponse to use.
        mock_response = mock.Mock()
        mock_response.json.return_value = json
        mock_response.status_code = 200

        get_streams.return_value = mock_response
        
        # Case 1: User is online.
        self.assertTrue(twitch_helpers.is_twitch_online(self.user))

        # Case 2: User is offline.
        mock_response.json.return_value = {}
        self.assertFalse(twitch_helpers.is_twitch_online(self.user))

        # Case 3: Bad response from request
        mock_response.status_code = 401
        self.assertFalse(twitch_helpers.is_twitch_online(self.user))

    @mock.patch("twitch_helpers.ap_handlers.stop_fetching_twitch_data")
    @mock.patch("twitch_helpers.ap_handlers.stop_tweeting")
    def test_handle_check_stream_failures(self, stop_fetch, stop_tweet):
        """A user's stream must be seen offline twice before ending jobs."""

        user_id = self.user.user_id

        # Case 1: This is the first stream failure.
        self.assertIsNone(twitch_helpers.handle_check_stream_failures(user_id))
        stop_fetch.assert_not_called()
        stop_tweet.assert_not_called()
        self.assertEqual(twitch_helpers.CHECK_STREAM_FAILURES[user_id], 1)

        # Case 2: This is the second stream failure.
        twitch_helpers.handle_check_stream_failures(user_id)
        stop_fetch.assert_called()
        stop_tweet.assert_called()
        self.assertEqual(twitch_helpers.CHECK_STREAM_FAILURES[user_id], 0)

    @mock.patch("twitch_helpers.requests.get")          
    def test_create_stream_url(self, requests_get):
        """Checks that url is constructed correctly."""

        twitch_id = self.user.twitch_id

        # Set up mock objects
        json = {"data": [{"login": "pixxeltesting"}]}
        mock_response = mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = json
        requests_get.return_value = mock_response
        
        # Case 1: Response ok
        expected_url = "https://www.twitch.tv/pixxeltesting"
        self.assertEqual(
            twitch_helpers.create_stream_url(twitch_id, self.user),
            expected_url
        )

        # Case 2: Respose !ok
        mock_response.status_code = 401
        self.assertIsNone(
            twitch_helpers.create_stream_url(twitch_id, self.user)
        )



if __name__ == "__main__":
    import unittest
    unittest.main()