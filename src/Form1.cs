using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Appium.Android.Enums;
using OpenQA.Selenium.Appium.Enums;
using OpenQA.Selenium.Appium.MultiTouch;
using OpenQA.Selenium.Appium.Service;
using SNSEyes;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Threading;
using System.Windows.Forms;

namespace testApp
{
    public partial class Form1 : Form
    {
        private static AndroidDriver<AndroidElement> driver;
        private static AppiumLocalService appiumLocalService;

        private AndroidElement searchButton;

        private AndroidElement firstSearchTextBox;

        private AndroidElement SecondSearchTextBox;

        private AndroidElement resultsList;

        private AndroidElement recentlyTab;

        private AndroidElement imageButton;

        private AndroidElement likeButton;

        private AndroidElement saveButton;

        private AndroidElement profile;

        private Instagram instagram;
        public Form1()
        {
            InitializeComponent();

            Init();

            instagram = new Instagram();


        }

        private void Init()
        {
            appiumLocalService = new AppiumServiceBuilder().UsingAnyFreePort().Build();

            appiumLocalService.Start();
            var appiumOptions = new AppiumOptions();
            //appiumOptions.AddAdditionalCapability(MobileCapabilityType.DeviceName, "SM-G950N");
            appiumOptions.AddAdditionalCapability(MobileCapabilityType.PlatformName, "Android");
            appiumOptions.AddAdditionalCapability(MobileCapabilityType.PlatformVersion, "9");
            appiumOptions.AddAdditionalCapability(MobileCapabilityType.App, "");
            appiumOptions.AddAdditionalCapability(MobileCapabilityType.AutomationName, "Appium");
            appiumOptions.AddAdditionalCapability(MobileCapabilityType.NewCommandTimeout, "10000");

            driver = new AndroidDriver<AndroidElement>(new Uri("http://127.0.0.1:4723/wd/hub"), appiumOptions);

            driver.Settings = new Dictionary<string, object>()
            {
                [AutomatorSetting.WaitForIDLETimeout] = 100,
                [AutomatorSetting.WaitForSelectorTimeout] = 100
            };


        }

        private void WaitForElement(string path)
        {
            while (true)
            {
                try
                {
                    driver.FindElementByXPath(path).Click();
                    driver.FindElementByXPath(path).ClearCache();
                    break;

                }
                catch (Exception)
                {
                    continue;
                }
                
            }
        }
        private async void button1_Click(object sender, EventArgs e) //#대구필라테스, 인스타 나무
        {

            
            var text = textBox1.Text.Replace("#", "");

            await instagram.RecentlyHashtag(text, textBox2.Text); //웹브라우저 api버전이라 파이썬으로 한번긁어와보기, 오차시 내용검색해서 맞으면 찍기

            int imgCount = int.Parse(textBox3.Text);
            int count = instagram.IndexList.Count;
            for (int j = 0; j < imgCount; j++)
            {
                searchButton = driver.FindElementById("com.instagram.android:id/search_tab");

                searchButton.Click();

                firstSearchTextBox = driver.FindElementById("com.instagram.android:id/action_bar_search_edit_text");

                firstSearchTextBox.Click();

                SecondSearchTextBox = driver.FindElementById("com.instagram.android:id/action_bar_search_edit_text");

                SecondSearchTextBox.SendKeys(textBox1.Text);

                driver.PressKeyCode(66);

                WaitForElement("//android.widget.TextView[@text=\"태그\"]");

                WaitForElement("//android.widget.TextView[@text=\"" + textBox1.Text + "\"]");
               
                WaitForElement("//android.widget.TextView[@content-desc=\"최근 게시물\"]");

                Thread.Sleep(3000);
                int amount = 1;

                for (int i = 0; i < count; i++)
                {

                    try
                    {

                        ClickEvent(i);
                        Thread.Sleep(500);
                        driver.Navigate().Back();
                        driver.Navigate().Back();
                        if (amount > 3)
                        {
                            break;
                        }
                        amount++;

                    }
                    catch (Exception ex)
                    {
                        swipeScreen(2);
                        i--;


                    }

                }
                AndroidElement avastar = driver.FindElementById("com.instagram.android:id/tab_avatar");

                avastar.Click();

                AndroidElement acountList = driver.FindElementById("com.instagram.android:id/action_bar_title_chevron");

                acountList.Click();

                Thread.Sleep(400);

                swipeScreen(2);

                Thread.Sleep(300);

                var end = driver.FindElementByXPath("//android.widget.LinearLayout[@index=\"7\"]");

                end.Click();

                Thread.Sleep(1000);



            }


        }
        private void ClickEvent(int index)
        {

            var isCaption = instagram.IndexList[index];

            driver.FindElementByXPath("//*[contains(@content-desc,'" + isCaption + "')]").Click(); //중요내용

            Thread.Sleep(50);

            driver.FindElementById("com.instagram.android:id/row_feed_button_like").Click();

            Thread.Sleep(50);

            driver.FindElementById("com.instagram.android:id/row_feed_button_save").Click();

            Thread.Sleep(50);

            driver.FindElementById("com.instagram.android:id/row_feed_photo_profile_imageview").Click();

            Thread.Sleep(2000);

        }


        private void swipeScreen(int dir)
        {

            int ANIMATION_TIME = 200; // ms

            int edgeBorder = 10; // better avoid edges

            Point pointOptionStart, pointOptionEnd;


            // init screen variables
            var dims = driver.Manage().Window.Size;

            // init start point = center of screen
            pointOptionStart = new Point(dims.Width / 2, dims.Height / 2);
            pointOptionEnd = new Point(0, 0);
            switch (dir)
            {
                case 1: // center of footer
                    pointOptionEnd = new Point(dims.Width / 2, dims.Height - edgeBorder);
                    break;
                case 2: // center of header
                    pointOptionEnd = new Point(dims.Width / 2, edgeBorder);
                    break;
                case 3: // center of left side
                    pointOptionEnd = new Point(edgeBorder, dims.Height / 2);
                    break;
                case 4: // center of right side
                    pointOptionEnd = new Point(dims.Width - edgeBorder, dims.Height / 2);
                    break;
                default:
                    break;
            }

            // execute swipe using TouchAction
            try
            {
                new TouchAction(driver)
                        .Press(pointOptionStart.X, pointOptionStart.Y)
                        // a bit more reliable when we add small wait
                        .Wait(600)
                        .MoveTo(pointOptionEnd.X, pointOptionEnd.Y)
                        .Release().Perform();
            }
            catch (Exception e)
            {

                return;
            }

            Thread.Sleep(ANIMATION_TIME);


        }

        private async void button2_Click(object sender, EventArgs e)
        {
            Enabled = false;
            bool loginSucceed = await instagram.Login();
            if (loginSucceed == true)
            {
                MessageBox.Show("Login Success");
                Enabled = true;

            }
            else
            {
                MessageBox.Show("Login failed");
                this.Close();
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            swipeScreen(2);
        }
    }
}