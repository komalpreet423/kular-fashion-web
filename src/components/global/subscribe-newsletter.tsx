import { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "@/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SubscribeNewsletter() {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [newsletterBg, setNewsletterBg] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <motion.div
      className="w-full flex items-center justify-center p-6 bg-cover bg-center relative min-h-[40vh]"
      style={{
        backgroundImage: newsletterBg ? `url(${newsletterBg})` : undefined,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {newsletterBg && (
        <div className="absolute inset-0 bg-black/30 z-0 rounded-xl"></div>
      )}

      <motion.div
        className="relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-full max-w-4xl p-6 shadow-xl bg-white rounded-2xl">
          <CardContent className="text-center">
            <motion.h2
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Subscribe to Our Newsletter
            </motion.h2>
            <motion.p
              className="text-gray-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Sign up for exclusive early sale access and tailored new arrivals
            </motion.p>

            {!submitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="mt-4 flex flex-col sm:flex-row gap-3 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg h-12"
                    required
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" className="px-6 py-3 uppercase h-12">
                    Subscribe
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.p
                className="text-green-600 mt-4 text-lg font-semibold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                🎉 Thank you for subscribing!
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
