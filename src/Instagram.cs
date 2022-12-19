using InstagramApiSharp;
using InstagramApiSharp.API;
using InstagramApiSharp.API.Builder;
using InstagramApiSharp.Classes;
using InstagramApiSharp.Classes.Android.DeviceInfo;
using InstagramApiSharp.Classes.Models;
using InstagramApiSharp.Classes.SessionHandlers;
using InstagramApiSharp.Logger;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace SNSEyes
{
    internal class Instagram
    {
        private static IInstaApi api;

        private const string StateFile = "state.bin";

        private List<string> indexList = new List<string>();

        public List<string> IndexList { get => indexList; set => indexList = value; }

        public async Task<bool> Login()
        {
            var userSession = new UserSessionData
            {
                UserName = "gogh_72",//sunlightface
                Password = "vkdlfl12" //superslf12@12
            };
            var androidDevice = new AndroidDevice
            {

                AndroidBoardName = "msm8996",
                AndroidBootloader = "G935TUVU3APG1",
                DeviceBrand = "samsung",
                DeviceModel = "SM-G935T",
                DeviceModelBoot = "qcom",
                DeviceModelIdentifier = "hero2qltetmo",
                FirmwareBrand = "hero2qltetmo",
                FirmwareFingerprint =
                        "samsung/hero2qltetmo/hero2qltetmo:6.0.1/MMB29M/G935TUVU3APG1:user/release-keys",
                FirmwareTags = "release-keys",
                FirmwareType = "user",
                HardwareManufacturer = "samsung",
                HardwareModel = "SM-G935T",
                DeviceGuid = Guid.NewGuid(),
                PhoneGuid = Guid.NewGuid(),
                Resolution = "1440x2560",
                Dpi = "640dpi"

            };


            api = InstaApiBuilder.CreateBuilder()
                .SetUser(userSession)
                .UseLogger(new DebugLogger(InstagramApiSharp.Logger.LogLevel.All))
                .SetRequestDelay(RequestDelay.FromSeconds(0, 1))
                .SetDevice(androidDevice)
                // Session handler, set a file path to save/load your state/session data
                .SetSessionHandler(new FileSessionHandler() { FilePath = StateFile })
                .Build();

            //Load session

            LoadSession();
            bool loginSucceeded = false;
            if (!api.IsUserAuthenticated)
            {
                // Call this function before calling LoginAsync
                await api.SendRequestsBeforeLoginAsync();
                // wait 5 seconds
                await Task.Delay(5000);
                var logInResult = await api.LoginAsync();

                if (logInResult.Succeeded)
                {


                    // Call this function after a successful login
                    await api.SendRequestsAfterLoginAsync();

                    loginSucceeded = true;
                    // Save session 

                }
                else
                {
                    loginSucceeded = false;
                }


            }
            return loginSucceeded;
        }


        private static void LoadSession()
        {

            api?.SessionHandler?.Load();

        }

        public async Task RecentlyHashtag(string hashtag, string textbox)
        {
            var result = await api.HashtagProcessor.GetRecentHashtagMediaListAsync(hashtag, PaginationParameters.MaxPagesToLoad(2));

            Task.Delay(1000).Wait();

            var list = result.Value.Medias;

            IndexList.Clear();

            for(int i = 0; i < list.Count; i++)
            {
                if (list[i].Caption != null)
                {
                    var caption = list[i].Caption.Text;
                    if (caption.Contains(textbox))
                    {

                        string isCaption = list[i].User.FullName.ToString();
                        indexList.Add(isCaption);
                    }
                }
                
               
            }

        }
        public async Task UpLoadImg()
        {
            var mediaImage = new InstaImageUpload
            {
                // leave zero, if you don't know how height and width is it.
                Height = 1080,
                Width = 1080,
                Uri = @"sibal.jpg"
            };
            // Add user tag (tag people)

            var result = await api.HashtagProcessor.GetTopHashtagMediaListAsync("대구필라테스", PaginationParameters.MaxPagesToLoad(1));


            var list = result.Value.Medias;



        }


    }

}
